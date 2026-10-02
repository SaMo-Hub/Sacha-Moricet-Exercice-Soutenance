// Les actions sont exécutées côté serveur
"use server";

import { NextResponse } from "next/server";
import { openDb } from "@/utils/database";
import { nowAtPark } from "@/utils/dates";
import { Activity } from "@/types/Activity";

// Options de la liste des activités
type GetActivitiesOptions = {
  search?: string; // recherche par nom
  typeId?: number; // filtre par type d'activité
  upcomingOnly?: boolean; // masque les activités passées (par défaut)
  limit?: number; // nombre maximum de résultats
};

export async function getActivities({
  search = "",
  typeId,
  upcomingOnly = true,
  limit = 100,
}: GetActivitiesOptions = {}) {
  const db = await openDb();

  // Construction dynamique de la clause WHERE, toujours avec des paramètres "?"
  // (jamais de concaténation de la saisie utilisateur : pas d'injection SQL)
  const conditions: string[] = [];
  const values: (string | number)[] = [];

  if (search.trim() !== "") {
    conditions.push("a.nom LIKE ?");
    values.push(`%${search.trim()}%`);
  }
  if (typeId) {
    conditions.push("a.type_id = ?");
    values.push(typeId);
  }
  if (upcomingOnly) {
    conditions.push("a.datetime_debut >= ?");
    values.push(nowAtPark());
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Get activities, with their type name and the number of active reservations
  const sql = `
    SELECT a.id, a.nom, a.type_id, a.places_disponibles, a.description,
           a.datetime_debut, a.duree, t.nom AS type_nom,
           (SELECT COUNT(*) FROM reservations r
            WHERE r.activite_id = a.id AND r.etat = 1) AS places_reservees
    FROM activites a
    INNER JOIN type_activite t ON t.id = a.type_id
    ${where}
    ORDER BY a.datetime_debut ASC
    LIMIT ?`;
  const activities: Activity[] = await db.all(sql, ...values, limit);

  return NextResponse.json(activities);
}

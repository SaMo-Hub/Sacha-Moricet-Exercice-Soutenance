// Les actions sont exécutées côté serveur
"use server";

import { NextResponse } from "next/server";
import { openDb } from "@/utils/database";
import { Activity } from "@/types/Activity";

export async function getActivity(id: number) {
  // Un identifiant non numérique ne peut correspondre à aucune activité
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ message: "Activité introuvable" }, { status: 404 });
  }

  const db = await openDb();

  // Get one activity by id
  const sql = `
    SELECT a.id, a.nom, a.type_id, a.places_disponibles, a.description,
           a.datetime_debut, a.duree, t.nom AS type_nom,
           (SELECT COUNT(*) FROM reservations r
            WHERE r.activite_id = a.id AND r.etat = 1) AS places_reservees
    FROM activites a
    INNER JOIN type_activite t ON t.id = a.type_id
    WHERE a.id = ?`;
  const activity: Activity | undefined = await db.get(sql, id);

  // If no result
  if (!activity) {
    return NextResponse.json({ message: "Activité introuvable" }, { status: 404 });
  }

  return NextResponse.json(activity);
}

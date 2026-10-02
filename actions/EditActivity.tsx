// Les actions sont exécutées côté serveur
"use server";

import { NextResponse } from "next/server";
import { openDb } from "@/utils/database";
import { checkAdmin } from "@/utils/sessions";
import { Activity } from "@/types/Activity";

// Mise à jour d'une activité en base (données déjà validées par UpdateActivity)
export async function editActivity(id: number, activity: Activity) {
  // Cette fonction est appelable depuis le navigateur : on revérifie le rôle
  const isAdmin = await checkAdmin();
  if (isAdmin.status >= 300) return isAdmin;

  const db = await openDb();

  // Check that the activity type exists
  const type = await db.get("SELECT id FROM type_activite WHERE id = ?", activity.type_id);
  if (!type) {
    return NextResponse.json({ message: "Ce type d'activité n'existe pas" }, { status: 400 });
  }

  // On ne peut pas descendre sous le nombre de places déjà réservées
  const { total } = await db.get(
    "SELECT COUNT(*) AS total FROM reservations WHERE activite_id = ? AND etat = 1",
    id
  );
  if (activity.places_disponibles < total) {
    return NextResponse.json(
      {
        field: "places_disponibles",
        message: `${total} places sont déjà réservées : impossible d'en proposer moins`,
      },
      { status: 409 }
    );
  }

  // Update the activity
  const sql = `UPDATE activites
               SET nom = ?, type_id = ?, places_disponibles = ?, description = ?, datetime_debut = ?, duree = ?
               WHERE id = ?`;
  const activityEdit = await db.run(
    sql,
    activity.nom,
    activity.type_id,
    activity.places_disponibles,
    activity.description,
    activity.datetime_debut,
    activity.duree,
    id
  );

  // If no row was updated, the activity does not exist
  if (activityEdit.changes === 0) {
    return NextResponse.json({ message: "Activité introuvable" }, { status: 404 });
  }

  return NextResponse.json({ id });
}

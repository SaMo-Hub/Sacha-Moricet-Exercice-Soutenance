// Les actions sont exécutées côté serveur
"use server";

import { NextResponse } from "next/server";
import { openDb } from "@/utils/database";
import { checkAdmin } from "@/utils/sessions";
import { Activity } from "@/types/Activity";

// Insertion d'une activité en base (données déjà validées par CreateActivity)
export async function addActivity(activity: Activity) {
  // Cette fonction est appelable depuis le navigateur : on revérifie le rôle
  const isAdmin = await checkAdmin();
  if (isAdmin.status >= 300) return isAdmin;

  const db = await openDb();

  // Check that the activity type exists
  const type = await db.get("SELECT id FROM type_activite WHERE id = ?", activity.type_id);
  if (!type) {
    return NextResponse.json({ message: "Ce type d'activité n'existe pas" }, { status: 400 });
  }

  // Insert new activity
  const sql = `INSERT INTO activites (nom, type_id, places_disponibles, description, datetime_debut, duree)
               VALUES (?, ?, ?, ?, ?, ?)`;
  const activityAdd = await db.run(
    sql,
    activity.nom,
    activity.type_id,
    activity.places_disponibles,
    activity.description,
    activity.datetime_debut,
    activity.duree
  );

  return NextResponse.json({ id: activityAdd.lastID }, { status: 201 });
}

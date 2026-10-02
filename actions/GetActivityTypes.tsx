// Les actions sont exécutées côté serveur
"use server";

import { NextResponse } from "next/server";
import { openDb } from "@/utils/database";
import { ActivityType } from "@/types/ActivityType";

export async function getActivityTypes() {
  const db = await openDb();

  // Get all activity types, by name
  const sql = `SELECT id, nom FROM type_activite ORDER BY nom ASC`;
  const types: ActivityType[] = await db.all(sql);

  return NextResponse.json(types);
}

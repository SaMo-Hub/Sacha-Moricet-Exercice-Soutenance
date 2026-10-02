// Les actions sont exécutées côté serveur
"use server";

import { NextResponse } from "next/server";
import { openDb } from "@/utils/database";
import { getSession } from "@/utils/sessions";

// Réservation active de l'utilisateur connecté pour une activité donnée (ou null)
export async function getUserReservation(activite_id: number) {
  // Get user logged
  const session = await getSession();
  if (!session) return NextResponse.json(null);

  const db = await openDb();

  const sql = `SELECT id, date_reservation FROM reservations
               WHERE activite_id = ? AND user_id = ? AND etat = 1`;
  const reservation = await db.get(sql, activite_id, session.id);

  return NextResponse.json(reservation ?? null);
}

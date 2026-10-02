"use server";

import { getSession } from "@/utils/sessions";
import { openDb } from "@/utils/database";
import { NextResponse } from "next/server";

// GET /api/reservations : réservations de l'utilisateur connecté
export async function GET() {
  // Get user logged
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { message: "Vous devez être connecté" },
      { status: 403 }
    );
  }

  // Call getReservations function (see below)
  const response = await getReservations(session.id);

  return NextResponse.json({ response });
}

async function getReservations(user_id: number) {
  const db = await openDb();

  // Toutes les réservations de l'utilisateur, avec l'activité et son type,
  // les plus proches dans le temps en premier
  const sql = `
    SELECT r.id, r.user_id, r.activite_id, r.date_reservation, r.etat,
           a.nom AS activite_nom, a.datetime_debut, a.duree, t.nom AS type_nom
    FROM reservations r
    INNER JOIN activites a ON a.id = r.activite_id
    INNER JOIN type_activite t ON t.id = a.type_id
    WHERE r.user_id = ?
    ORDER BY a.datetime_debut ASC`;
  const reservations = await db.all(sql, user_id);

  return reservations;
}

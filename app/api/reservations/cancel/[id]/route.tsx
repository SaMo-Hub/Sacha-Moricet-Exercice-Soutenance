"use server";

import { getSession } from "@/utils/sessions";
import { openDb } from "@/utils/database";
import { isPast } from "@/utils/dates";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// PATCH /api/reservations/cancel/[id] : annule une réservation (etat passe à false).
// On ne supprime pas la ligne pour garder l'historique.
export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  // Get the id from params
  const id = Number((await params).id);

  // Get user logged
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { message: "Vous devez être connecté" },
      { status: 403 }
    );
  }

  if (!Number.isInteger(id)) {
    return NextResponse.json(
      { message: "Réservation introuvable" },
      { status: 404 }
    );
  }

  // Call cancelReservation function (see below)
  return await cancelReservation(id, session.id);
}

async function cancelReservation(reservation_id: number, user_id: number) {
  const db = await openDb();

  // Récupération de la réservation et de la date de l'activité
  const verifSql = `
    SELECT r.id, r.user_id, r.etat, a.datetime_debut
    FROM reservations r
    INNER JOIN activites a ON a.id = r.activite_id
    WHERE r.id = ?`;
  const reservation = await db.get(verifSql, reservation_id);

  if (!reservation) {
    return NextResponse.json(
      { message: "Réservation introuvable" },
      { status: 404 }
    );
  }

  // Empêche d'annuler une réservation qui ne nous appartient pas
  if (reservation.user_id !== user_id) {
    return NextResponse.json(
      { message: "Cette réservation ne vous appartient pas" },
      { status: 403 }
    );
  }

  if (!reservation.etat) {
    return NextResponse.json(
      { message: "Cette réservation est déjà annulée" },
      { status: 409 }
    );
  }

  if (isPast(reservation.datetime_debut)) {
    return NextResponse.json(
      { message: "Impossible d'annuler une activité déjà commencée" },
      { status: 409 }
    );
  }

  const sql = "UPDATE reservations SET etat = 0 WHERE id = ? AND user_id = ?";
  await db.run(sql, reservation_id, user_id);

  // La place libérée doit apparaître immédiatement sur les pages d'activités
  revalidatePath("/activites", "layout");

  return NextResponse.json({ message: "Réservation annulée" });
}

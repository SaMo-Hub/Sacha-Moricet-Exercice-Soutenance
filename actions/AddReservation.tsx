// Les actions sont exécutées côté serveur
"use server";

import { NextResponse } from "next/server";
import { openDb } from "@/utils/database";
import { getSession } from "@/utils/sessions";
import { isPast } from "@/utils/dates";

// Enregistre une réservation de l'utilisateur connecté pour une activité
export async function addReservation(activite_id: number) {
  // Get the logged user
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { message: "Connectez-vous pour réserver" },
      { status: 403 }
    );
  }

  const db = await openDb();

  // L'activité existe-t-elle, et combien de places sont prises ?
  const activitySql = `
    SELECT a.id, a.places_disponibles, a.datetime_debut,
           (SELECT COUNT(*) FROM reservations r
            WHERE r.activite_id = a.id AND r.etat = 1) AS places_reservees
    FROM activites a WHERE a.id = ?`;
  const activity = await db.get(activitySql, activite_id);

  if (!activity) {
    return NextResponse.json({ message: "Activité introuvable" }, { status: 404 });
  }

  if (isPast(activity.datetime_debut)) {
    return NextResponse.json(
      { message: "Cette activité a déjà commencé" },
      { status: 409 }
    );
  }

  // Check if the user already booked this activity
  const verifSql = `SELECT id FROM reservations WHERE activite_id = ? AND user_id = ? AND etat = 1`;
  const verif = await db.get(verifSql, activite_id, session.id);

  if (verif) {
    return NextResponse.json(
      { message: "Vous avez déjà réservé cette activité" },
      { status: 409 }
    );
  }

  // Empêche la réservation d'une activité complète
  if (activity.places_reservees >= activity.places_disponibles) {
    return NextResponse.json(
      { message: "Cette activité est complète" },
      { status: 409 }
    );
  }

  // Insert new reservation.
  // La condition sur les places est répétée dans la requête elle-même : si deux
  // personnes réservent la dernière place au même instant, une seule insertion passe.
  const sql = `
    INSERT INTO reservations (user_id, activite_id)
    SELECT ?, a.id FROM activites a
    WHERE a.id = ?
      AND a.places_disponibles > (SELECT COUNT(*) FROM reservations r
                                  WHERE r.activite_id = a.id AND r.etat = 1)`;
  const reservationAdd = await db.run(sql, session.id, activite_id);

  if (reservationAdd.changes === 0) {
    return NextResponse.json(
      { message: "Cette activité est complète" },
      { status: 409 }
    );
  }

  return NextResponse.json({ id: reservationAdd.lastID }, { status: 201 });
}

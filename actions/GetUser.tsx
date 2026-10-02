// Les actions sont exécutées côté serveur
"use server";

import { NextResponse } from "next/server";
import { openDb } from "@/utils/database";
import { getSession } from "@/utils/sessions";
import { User } from "@/types/User";

// Profil de l'utilisateur connecté.
// Pas de paramètre id : on ne peut lire que son propre profil.
export async function getUser() {
  // Get user logged
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Vous devez être connecté" }, { status: 403 });
  }

  const db = await openDb();

  // Le mot de passe n'est jamais sélectionné
  const sql = `SELECT id, prenom, nom, email, role FROM users WHERE id = ?`;
  const user: User | undefined = await db.get(sql, session.id);

  // If no result (compte supprimé entre-temps)
  if (!user) {
    return NextResponse.json({ message: "Utilisateur introuvable" }, { status: 404 });
  }

  return NextResponse.json(user);
}

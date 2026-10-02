// Les actions sont exécutées côté serveur
"use server";

import { NextResponse } from "next/server";
import { openDb } from "@/utils/database";
import { createCookie, getSession } from "@/utils/sessions";
import { hashPassword } from "@/utils/bcryptjs";

// Mise à jour du profil de l'utilisateur connecté (données validées par UpdateProfile)
export async function editProfile(
  prenom: string,
  nom: string,
  email: string,
  motdepasse: string // vide = mot de passe inchangé
) {
  // Get the logged user : on ne peut modifier que son propre profil
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Vous devez être connecté" }, { status: 403 });
  }

  const db = await openDb();

  // Check that the e-mail is not already used by another account
  const verifSql = "SELECT id FROM users WHERE email = ? AND id != ?";
  const verif = await db.get(verifSql, email, session.id);

  if (verif) {
    return NextResponse.json(
      { field: "email", message: "Cette adresse e-mail est déjà utilisée" },
      { status: 409 }
    );
  }

  if (motdepasse !== "") {
    // Nouveau mot de passe : haché avant d'être enregistré
    const hash = await hashPassword(motdepasse);
    const sql = "UPDATE users SET prenom = ?, nom = ?, email = ?, motdepasse = ? WHERE id = ?";
    await db.run(sql, prenom, nom, email, hash, session.id);
  } else {
    const sql = "UPDATE users SET prenom = ?, nom = ?, email = ? WHERE id = ?";
    await db.run(sql, prenom, nom, email, session.id);
  }

  // Le prénom et l'e-mail sont dans le JWT : on régénère le cookie
  await createCookie({ id: session.id, email, prenom, role: session.role });

  return NextResponse.json({ message: "Profil mis à jour" });
}

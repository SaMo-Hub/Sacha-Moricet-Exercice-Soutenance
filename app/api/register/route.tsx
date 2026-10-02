"use server";

import { NextResponse } from "next/server";
import { z } from "zod";
import { openDb } from "@/utils/database";

// Règles de validation du corps de la requête.
// Le mot de passe arrive déjà haché par le client (voir RegisterForm) :
// on vérifie donc qu'il s'agit bien d'un hash bcrypt et pas d'un mot de passe en clair.
const RegisterSchema = z.object({
  prenom: z.string().trim().min(1).max(255),
  nom: z.string().trim().min(1).max(255),
  email: z.email().max(255),
  password: z.string().regex(/^\$2[aby]\$\d{2}\$.{53}$/),
});

export async function POST(req: Request) {
  // Get body request
  const body = await req.json();
  const validatedFields = RegisterSchema.safeParse(body);

  // If the data are invalid
  if (!validatedFields.success) {
    return NextResponse.json(
      { message: "Les informations saisies sont invalides" },
      { status: 400 }
    );
  }

  const { prenom, nom, email, password } = validatedFields.data;

  // Call register function (see below)
  const response = await register(prenom, nom, email.toLowerCase(), password);

  // If response is false
  if (response == false) {
    // Return an appropriate error message
    return NextResponse.json(
      { message: "Un compte existe déjà avec cette adresse e-mail" },
      { status: 403 }
    );
  }

  return NextResponse.json({ response }, { status: 201 });
}

async function register(
  prenom: string,
  nom: string,
  email: string,
  password: string
) {
  const db = await openDb();

  // Verify that the user does not exist yet
  const verif = `SELECT email FROM users WHERE email = ?`;
  const userVerif = await db.get(verif, email);

  if (userVerif) {
    return false;
  }

  // Insert the new user (le rôle "user" est appliqué par défaut en base)
  const sql = `INSERT INTO users (prenom, nom, email, motdepasse) VALUES (?, ?, ?, ?)`;
  const insert = await db.run(sql, prenom, nom, email, password);

  return insert.lastID;
}

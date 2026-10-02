"use server";

import { checkPassword } from "@/utils/bcryptjs";
import { createCookie } from "@/utils/sessions";
import { openDb } from "@/utils/database";
import { User } from "@/types/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Get body request
  const body = await req.json();
  const { email, password } = body;

  // Champs manquants ou mal typés
  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json(
      { message: "Tous les champs sont obligatoires" },
      { status: 400 }
    );
  }

  // Call login function (see below)
  const user = await login(email.trim().toLowerCase(), password);

  // If response is false
  if (user == false) {
    // Return an appropriate error message (volontairement vague : on ne dit pas
    // si c'est l'e-mail ou le mot de passe qui est faux)
    return NextResponse.json(
      { message: "E-mail ou mot de passe incorrect" },
      { status: 403 }
    );
  }

  // Data to add in the JWT payload : id, e-mail, prénom (pour le menu) et rôle
  await createCookie({
    id: user.id as number,
    email: user.email,
    prenom: user.prenom,
    role: user.role,
  });

  return NextResponse.json({ role: user.role });
}

async function login(email: string, password: string) {
  const db = await openDb();

  // Check if a user exist with this email
  const verif = `SELECT id, prenom, email, motdepasse, role FROM users WHERE email = ?`;
  const userVerif: User | undefined = await db.get(verif, email);

  if (!userVerif || !userVerif.motdepasse) {
    return false;
  }

  // Check if password is correct
  const checkPwd = await checkPassword(password, userVerif.motdepasse);

  if (!checkPwd) {
    return false;
  }

  return userVerif;
}

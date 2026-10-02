// Gestion des sessions : JWT signé (librairie jose) stocké dans un cookie httpOnly.
//
// ⚠️ Pas de "use server" ici, contrairement au cours : toute fonction exportée d'un
// fichier "use server" devient une action appelable depuis le navigateur. Exposer
// createCookie() permettrait à n'importe qui de se fabriquer une session admin.
// Ces fonctions restent donc internes au serveur ; la déconnexion passe par
// l'action dédiée actions/Logout.tsx.

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SessionPayload } from "@/types/Session";

const secretKey = process.env.JWT_SECRET;
const key = new TextEncoder().encode(secretKey);

// Durée de vie de la session
const SESSION_DURATION = 2 * 60 * 60; // 2 heures, en secondes

// Create the JWT
export async function encrypt(payload: SessionPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`) // JWT expiration (2 heures)
    .sign(key);
}

// Read the JWT : renvoie null si le jeton est absent, falsifié ou expiré
export async function decrypt(input: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify<SessionPayload>(input, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    console.log(error);
    return null;
  }
}

// Create the cookie
export async function createCookie(sessionData: SessionPayload) {
  const encryptedSessionData = await encrypt(sessionData);
  const cookie = await cookies();

  cookie.set("session", encryptedSessionData, {
    httpOnly: true, // illisible en JavaScript côté client
    secure: process.env.NODE_ENV === "production", // HTTPS obligatoire en production
    sameSite: "lax", // limite les requêtes cross-site (CSRF)
    maxAge: SESSION_DURATION, // le cookie expire en même temps que le JWT
    path: "/",
  });
}

// Destroy the cookie
export async function logout() {
  const cookie = await cookies();
  // Destroy the session
  cookie.set("session", "", { expires: new Date(0), path: "/" });
}

// Read the cookie
export async function getSession() {
  const cookie = await cookies();
  const session = cookie.get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

// Vérifie qu'un utilisateur est connecté (statut 200) ou non (statut 403)
export async function checkAuth() {
  const session = await getSession();

  if (!session) {
    // If no session set (ou jeton invalide)
    return NextResponse.json(
      { message: "Vous devez être connecté" },
      { status: 403 }
    );
  }

  if (!session.exp || session.exp * 1000 < Date.now()) {
    // If JWT expired (exp est en secondes, Date.now() en millisecondes)
    return NextResponse.json({ message: "Session expirée" }, { status: 403 });
  }

  return NextResponse.json({ message: "Logged" }, { status: 200 });
}

// Vérifie que l'utilisateur connecté est administrateur
export async function checkAdmin() {
  const isAuthorized = await checkAuth();
  if (isAuthorized.status >= 300) return isAuthorized;

  const session = await getSession();
  if (session?.role !== "admin") {
    return NextResponse.json(
      { message: "Accès réservé aux administrateurs" },
      { status: 403 }
    );
  }

  return NextResponse.json({ message: "Admin" }, { status: 200 });
}

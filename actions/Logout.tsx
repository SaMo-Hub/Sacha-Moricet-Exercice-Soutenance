// Les actions sont exécutées côté serveur
"use server";

import { logout } from "@/utils/sessions";

// Déconnexion : appelée depuis le bouton du menu (composant client)
export async function Logout() {
  await logout(); // Destroy the cookie
}

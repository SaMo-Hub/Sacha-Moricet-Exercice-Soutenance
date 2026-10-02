// Les actions sont exécutées côté serveur
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { openDb } from "@/utils/database";
import { getSession, logout } from "@/utils/sessions";

// Suppression du compte de l'utilisateur connecté
export async function DeleteProfile() {
  // Get the logged user : on ne peut supprimer que son propre compte
  const session = await getSession();
  if (!session) {
    return { message: "Vous devez être connecté" };
  }

  try {
    const db = await openDb();

    // Le parc doit toujours garder au moins un administrateur
    if (session.role === "admin") {
      const { total } = await db.get("SELECT COUNT(*) AS total FROM users WHERE role = 'admin'");
      if (total <= 1) {
        return { message: "Vous êtes le dernier administrateur : votre compte ne peut pas être supprimé" };
      }
    }

    // Ses réservations sont supprimées automatiquement (ON DELETE CASCADE),
    // ce qui libère les places des activités à venir
    await db.run("DELETE FROM users WHERE id = ?", session.id);

    // Destroy the session
    await logout();
  } catch (error) {
    console.error(error);
    return { message: "Une erreur est survenue, votre compte n'a pas été supprimé" };
  }

  revalidatePath("/", "layout");
  redirect("/?message=account-deleted");
}

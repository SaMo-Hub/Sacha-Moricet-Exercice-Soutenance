// Les actions sont exécutées côté serveur
"use server";

import { revalidatePath } from "next/cache";
import { addReservation } from "./AddReservation";
import { ReservationError } from "@/types/FormState";

// Réservation d'une activité, appelée par useActionState (ReservationForm).
// L'id de l'activité est lié en amont avec CreateReservation.bind(null, id).
export async function CreateReservation(
  activite_id: number,
  // État précédent imposé par useActionState, inutile ici
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  prevState: ReservationError
): Promise<ReservationError> {
  try {
    // Add the reservation (see "/actions/AddReservation.tsx")
    const add = await addReservation(activite_id);

    // If there is an error (activité complète, déjà réservée, ...)
    if (!add.ok || add.status >= 300) {
      const { message } = await add.json();
      return { message, success: false };
    }
  } catch (error) {
    console.error(error);
    return { message: "Une erreur est survenue", success: false };
  }

  // Les places restantes changent sur la fiche et dans les listes
  revalidatePath("/activites", "layout");
  revalidatePath("/");

  return { message: "Réservation confirmée !", success: true };
}

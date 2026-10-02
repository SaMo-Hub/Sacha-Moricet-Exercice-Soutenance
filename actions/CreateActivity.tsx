// Les actions sont exécutées côté serveur
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addActivity } from "./AddActivity";
import { ActivitySchema } from "@/utils/schemas";
import { ActivityError } from "@/types/FormState";
import { isPast } from "@/utils/dates";

// Validation du formulaire de création, appelée par useActionState (ActivityForm)
export async function CreateActivity(prevState: ActivityError, formData: FormData) {
  try {
    // Validate the form
    const validatedFields = ActivitySchema.safeParse(Object.fromEntries(formData));

    if (!validatedFields.success) {
      return {
        errors: z.flattenError(validatedFields.error).fieldErrors,
        message: "Le formulaire contient des erreurs",
      };
    }

    // Une nouvelle activité ne peut pas commencer dans le passé
    if (isPast(validatedFields.data.datetime_debut)) {
      return {
        errors: { datetime_debut: ["La date doit être dans le futur"] },
        message: "Le formulaire contient des erreurs",
      };
    }

    // Add the activity (see "/actions/AddActivity.tsx")
    const add = await addActivity(validatedFields.data);

    // If there is an error during activity add process
    if (!add.ok || add.status >= 300) {
      const { message } = await add.json();
      return { message };
    }
  } catch (error) {
    console.error(error);
    return { message: "Une erreur est survenue" };
  }

  // Here, activity was successfully added : on met à jour les listes publiques
  revalidatePath("/", "layout");
  redirect("/admin?message=created");
}

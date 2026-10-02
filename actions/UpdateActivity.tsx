// Les actions sont exécutées côté serveur
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { editActivity } from "./EditActivity";
import { ActivitySchema } from "@/utils/schemas";
import { ActivityError } from "@/types/FormState";

// Validation du formulaire de modification.
// L'id est lié en amont avec UpdateActivity.bind(null, id) dans ActivityForm.
export async function UpdateActivity(
  id: number,
  prevState: ActivityError,
  formData: FormData
) {
  try {
    // Validate the form
    const validatedFields = ActivitySchema.safeParse(Object.fromEntries(formData));

    if (!validatedFields.success) {
      return {
        errors: z.flattenError(validatedFields.error).fieldErrors,
        message: "Le formulaire contient des erreurs",
      };
    }

    // Update the activity (see "/actions/EditActivity.tsx")
    const edit = await editActivity(id, validatedFields.data);

    // If there is an error during activity edit process
    if (!edit.ok || edit.status >= 300) {
      const { message, field } = await edit.json();
      // Erreur rattachée à un champ précis (ex. nombre de places trop bas)
      if (field) {
        return { errors: { [field]: [message] }, message };
      }
      return { message };
    }
  } catch (error) {
    console.error(error);
    return { message: "Une erreur est survenue" };
  }

  revalidatePath("/", "layout");
  redirect("/admin?message=updated");
}

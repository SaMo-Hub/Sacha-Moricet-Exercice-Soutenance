// Les actions sont exécutées côté serveur
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { editProfile } from "./EditProfile";
import { ProfileSchema } from "@/utils/schemas";
import { ProfileError } from "@/types/FormState";

// Validation du formulaire de profil, appelée par useActionState (ProfileForm)
export async function UpdateProfile(
  prevState: ProfileError,
  formData: FormData
): Promise<ProfileError> {
  try {
    // Validate the form
    const validatedFields = ProfileSchema.safeParse({
      prenom: formData.get("prenom"),
      nom: formData.get("nom"),
      email: String(formData.get("email") ?? "").trim().toLowerCase(),
      motdepasse: formData.get("motdepasse") ?? "",
    });

    if (!validatedFields.success) {
      return {
        errors: z.flattenError(validatedFields.error).fieldErrors,
        message: "Le formulaire contient des erreurs",
      };
    }

    const { prenom, nom, email, motdepasse } = validatedFields.data;

    // Update the profile (see "/actions/EditProfile.tsx")
    const edit = await editProfile(prenom, nom, email, motdepasse);

    if (!edit.ok || edit.status >= 300) {
      const { message, field } = await edit.json();
      if (field) {
        return { errors: { [field]: [message] }, message };
      }
      return { message };
    }
  } catch (error) {
    console.error(error);
    return { message: "Une erreur est survenue" };
  }

  // Le prénom est affiché dans le menu de toutes les pages
  revalidatePath("/", "layout");

  return { message: "Votre profil a été mis à jour", success: true };
}

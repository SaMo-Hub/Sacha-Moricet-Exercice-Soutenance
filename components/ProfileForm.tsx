"use client";

import { useActionState } from "react";
import { UpdateProfile } from "@/actions/UpdateProfile";
import { ProfileError } from "@/types/FormState";
import { User } from "@/types/User";
import FieldError from "./FieldError";
import FormMessage from "./FormMessage";

// Formulaire de modification du profil : mutation côté serveur avec
// affichage des erreurs dans le formulaire grâce à useActionState (cf. cours)
export default function ProfileForm({ user }: { user: User }) {
  const initialState: ProfileError = { message: null, errors: {} };
  const [state, formAction, isPending] = useActionState<ProfileError, FormData>(
    UpdateProfile,
    initialState
  );

  return (
    // noValidate : les erreurs viennent de zod (affichées sous chaque champ), pas des bulles du navigateur
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      {/* Message global : succès, ou erreur sans champ associé */}
      {state.success ? (
        <FormMessage type="success" message={state.message} />
      ) : (
        <FormMessage message={state.message} />
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="prenom" className="label">Prénom</label>
          <input
            type="text" name="prenom" id="prenom" defaultValue={user.prenom}
            autoComplete="given-name" className="input" required
            aria-invalid={!!state.errors?.prenom}
            aria-describedby={state.errors?.prenom ? "prenom-erreur" : undefined}
          />
          <FieldError id="prenom-erreur" errors={state.errors?.prenom} />
        </div>
        <div className="field">
          <label htmlFor="nom" className="label">Nom</label>
          <input
            type="text" name="nom" id="nom" defaultValue={user.nom}
            autoComplete="family-name" className="input" required
            aria-invalid={!!state.errors?.nom}
            aria-describedby={state.errors?.nom ? "nom-erreur" : undefined}
          />
          <FieldError id="nom-erreur" errors={state.errors?.nom} />
        </div>
      </div>

      <div className="field">
        <label htmlFor="email" className="label">Adresse e-mail</label>
        <input
          type="email" name="email" id="email" defaultValue={user.email}
          autoComplete="email" inputMode="email" className="input" required
          aria-invalid={!!state.errors?.email}
          aria-describedby={state.errors?.email ? "email-erreur" : undefined}
        />
        <FieldError id="email-erreur" errors={state.errors?.email} />
      </div>

      <div className="field">
        <label htmlFor="motdepasse" className="label">Nouveau mot de passe</label>
        <input
          type="password" name="motdepasse" id="motdepasse"
          autoComplete="new-password" className="input" minLength={8}
          aria-invalid={!!state.errors?.motdepasse}
          aria-describedby={`motdepasse-aide${state.errors?.motdepasse ? " motdepasse-erreur" : ""}`}
        />
        <p id="motdepasse-aide" className="hint">
          Laissez vide pour conserver votre mot de passe actuel. 8 caractères minimum.
        </p>
        <FieldError id="motdepasse-erreur" errors={state.errors?.motdepasse} />
      </div>

      <div>
        <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={isPending}>
          {isPending ? "Enregistrement…" : "Enregistrer les modifications"}
        </button>
      </div>
    </form>
  );
}

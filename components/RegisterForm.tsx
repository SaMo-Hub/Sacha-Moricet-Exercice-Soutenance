"use client";

import { hashPassword } from "@/utils/bcryptjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormEvent } from "react";
import FormMessage from "./FormMessage";
import FieldError from "./FieldError";

// Erreurs possibles par champ, vérifiées avant l'envoi
type RegisterErrors = Partial<Record<"prenom" | "nom" | "email" | "password" | "confirm", string>>;

export default function RegisterForm() {
  const [error, setError] = useState(""); // erreur globale (renvoyée par l'API)
  const [fieldErrors, setFieldErrors] = useState<RegisterErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission

    // Get data from form
    const form = e.currentTarget;
    const prenom = form.prenom.value.trim();
    const nom = form.nom.value.trim();
    const email = form.email.value.trim();
    const plainPassword = form.password.value;
    const confirm = form.confirm.value;

    // Vérification des champs avant l'envoi
    const errors: RegisterErrors = {};
    if (prenom == "") errors.prenom = "Le prénom est obligatoire";
    if (nom == "") errors.nom = "Le nom est obligatoire";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Adresse e-mail invalide";
    if (plainPassword.length < 8) errors.password = "8 caractères minimum";
    if (confirm !== plainPassword) errors.confirm = "Les mots de passe ne correspondent pas";

    setFieldErrors(errors);
    setError("");
    // If any data is invalid : focus sur le premier champ à corriger
    const firstInvalid = Object.keys(errors)[0];
    if (firstInvalid) {
      (form.elements.namedItem(firstInvalid) as HTMLInputElement | null)?.focus();
      return;
    }

    setIsLoading(true);
    try {
      // Hash password : le mot de passe ne transite jamais en clair (cf. cours)
      const password = await hashPassword(plainPassword);
      // Fetch "/api/register" route
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prenom,
          nom,
          email,
          password,
        }),
      });
      // If there is an error (user already exists for exemple)
      if (!response.ok || response.status >= 300) {
        const { message } = await response.json();
        setError(message);
        setIsLoading(false);
      } else {
        // Le bouton reste désactivé jusqu'à la redirection : pas de double inscription
        router.push("/login?message=registered"); // Redirect to login page
      }
    } catch (error) {
      console.error(error);
      setError("Une erreur est survenue, veuillez réessayer");
      setIsLoading(false);
    }
  };

  return (
    <form method="POST" onSubmit={handleRegister} noValidate className="flex flex-col gap-5">
      <FormMessage message={error} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="prenom" className="label">Prénom</label>
          <input
            type="text" name="prenom" id="prenom" placeholder="Léa"
            autoComplete="given-name" className="input"
            aria-invalid={!!fieldErrors.prenom}
            aria-describedby={fieldErrors.prenom ? "prenom-erreur" : undefined}
          />
          <FieldError id="prenom-erreur" errors={fieldErrors.prenom ? [fieldErrors.prenom] : undefined} />
        </div>
        <div className="field">
          <label htmlFor="nom" className="label">Nom</label>
          <input
            type="text" name="nom" id="nom" placeholder="Dupont"
            autoComplete="family-name" className="input"
            aria-invalid={!!fieldErrors.nom}
            aria-describedby={fieldErrors.nom ? "nom-erreur" : undefined}
          />
          <FieldError id="nom-erreur" errors={fieldErrors.nom ? [fieldErrors.nom] : undefined} />
        </div>
      </div>

      <div className="field">
        <label htmlFor="email" className="label">Adresse e-mail</label>
        <input
          type="email" name="email" id="email" placeholder="lea.dupont@gmail.com"
          autoComplete="email" inputMode="email" className="input"
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? "email-erreur" : undefined}
        />
        <FieldError id="email-erreur" errors={fieldErrors.email ? [fieldErrors.email] : undefined} />
      </div>

      <div className="field">
        <label htmlFor="password" className="label">Mot de passe</label>
        <input
          type="password" name="password" id="password"
          autoComplete="new-password" className="input"
          aria-invalid={!!fieldErrors.password}
          aria-describedby={`password-aide${fieldErrors.password ? " password-erreur" : ""}`}
        />
        <p id="password-aide" className="hint">8 caractères minimum.</p>
        <FieldError id="password-erreur" errors={fieldErrors.password ? [fieldErrors.password] : undefined} />
      </div>

      <div className="field">
        <label htmlFor="confirm" className="label">Confirmation du mot de passe</label>
        <input
          type="password" name="confirm" id="confirm"
          autoComplete="new-password" className="input"
          aria-invalid={!!fieldErrors.confirm}
          aria-describedby={fieldErrors.confirm ? "confirm-erreur" : undefined}
        />
        <FieldError id="confirm-erreur" errors={fieldErrors.confirm ? [fieldErrors.confirm] : undefined} />
      </div>

      <button type="submit" name="register" className="btn btn-primary btn-block h-12" disabled={isLoading}>
        {isLoading ? "Création du compte…" : "Créer mon compte"}
      </button>
    </form>
  );
}

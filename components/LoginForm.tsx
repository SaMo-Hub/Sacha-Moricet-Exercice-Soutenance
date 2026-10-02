"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { FormEvent } from "react";
import FormMessage from "./FormMessage";
import FlashMessage from "./FlashMessage";

// ⚠️ useSearchParams : ce composant doit être encadré par <Suspense> (app/login/page.tsx)
export default function LoginForm() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Page demandée avant la connexion (ajoutée par proxy.ts).
  // On n'accepte qu'un chemin interne ("/..." mais pas "//site-externe.com").
  const redirectParam = searchParams.get("redirect") ?? "";
  const redirectTo =
    redirectParam.startsWith("/") && !redirectParam.startsWith("//") ? redirectParam : null;

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission

    // Get data from form
    const email = e.currentTarget.email.value.trim();
    const password = e.currentTarget.password.value;
    // If any data is empty
    if (email == "" || password == "") {
      setError("Tous les champs sont obligatoires");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      // Fetch "/api/login" route
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      // If there is an error
      if (!response.ok || response.status >= 300) {
        const { message } = await response.json();
        setError(message);
        setIsLoading(false);
      } else {
        const { role } = await response.json();
        // Retour à la page demandée, sinon tableau de bord selon le rôle
        router.push(redirectTo ?? (role === "admin" ? "/admin" : "/mon-compte"));
        router.refresh(); // Met à jour l'en-tête (prénom, liens)
      }
    } catch (error) {
      console.error(error);
      setError("Une erreur est survenue, veuillez réessayer");
      setIsLoading(false);
    }
  };

  return (
    <form method="POST" onSubmit={handleLogin} noValidate className="flex flex-col gap-5">
      <FlashMessage code={searchParams.get("message") ?? undefined} />
      <FormMessage message={error} />

      <div className="field">
        <label htmlFor="email" className="label">Adresse e-mail</label>
        <input
          type="email" name="email" id="email" placeholder="lea.dupont@gmail.com"
          autoComplete="email" inputMode="email" className="input" autoFocus
        />
      </div>

      <div className="field">
        <label htmlFor="password" className="label">Mot de passe</label>
        <input type="password" name="password" id="password" autoComplete="current-password" className="input" />
      </div>

      <button type="submit" name="login" className="btn btn-primary btn-block h-12" disabled={isLoading}>
        {isLoading ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}

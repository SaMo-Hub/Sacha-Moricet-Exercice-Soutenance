"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

// Relance le rendu des composants serveur de la page (nouvelle requête à la base)
// sans recharger tout le navigateur : sert aux états d'erreur de chargement
export default function RetryButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="btn btn-secondary"
      disabled={isPending}
      onClick={() => startTransition(() => router.refresh())}
    >
      {isPending ? "Chargement…" : "Réessayer"}
    </button>
  );
}

"use client";

import Link from "next/link";
import { useEffect } from "react";
import StatusPage from "@/components/StatusPage";

// Capte les erreurs inattendues de toutes les routes
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      code="Oups"
      title="Une erreur est survenue"
      description="Quelque chose s'est mal passé de notre côté. Vous pouvez réessayer, ou revenir à l'accueil."
    >
      <button type="button" onClick={reset} className="btn btn-primary">
        Réessayer
      </button>
      <Link href="/" className="btn btn-secondary">
        Retour à l&apos;accueil
      </Link>
    </StatusPage>
  );
}

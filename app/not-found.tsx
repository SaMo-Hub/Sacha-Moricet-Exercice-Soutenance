import type { Metadata } from "next";
import Link from "next/link";
import StatusPage from "@/components/StatusPage";

export const metadata: Metadata = {
  title: "Page introuvable",
  description: "Cette page n'existe pas ou a été déplacée.",
};

// Page 404 : affichée pour toute URL inconnue et quand notFound() est appelé
export default function NotFound() {
  return (
    <StatusPage
      code="404"
      title="Vous vous êtes égaré en forêt"
      description="Cette page n'existe pas, ou l'activité que vous cherchez a été retirée du programme."
    >
      <Link href="/activites" className="btn btn-primary">
        Voir les activités
      </Link>
      <Link href="/" className="btn btn-secondary">
        Retour à l&apos;accueil
      </Link>
    </StatusPage>
  );
}

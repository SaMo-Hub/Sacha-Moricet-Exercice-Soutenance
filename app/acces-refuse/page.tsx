import type { Metadata } from "next";
import Link from "next/link";
import StatusPage from "@/components/StatusPage";

export const metadata: Metadata = {
  title: "Accès refusé",
  description: "Cette page est réservée aux administrateurs du parc.",
  robots: { index: false },
};

// Page vers laquelle proxy.ts redirige un utilisateur non administrateur
export default function AccesRefuse() {
  return (
    <StatusPage
      code="403"
      title="Accès réservé à l'équipe du parc"
      description="Cette page est réservée aux administrateurs. Si vous pensez qu'il s'agit d'une erreur, contactez l'accueil du parc."
    >
      <Link href="/activites" className="btn btn-primary">
        Voir les activités
      </Link>
      <Link href="/mon-compte" className="btn btn-secondary">
        Mon compte
      </Link>
    </StatusPage>
  );
}

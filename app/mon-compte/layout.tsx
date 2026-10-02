import type { Metadata } from "next";
import AccountNav from "@/components/AccountNav";
import { getSession } from "@/utils/sessions";

export const metadata: Metadata = {
  // Un layout qui définit son propre titre doit redéclarer le template
  // pour que ses pages enfants gardent le suffixe " · Les Cimes"
  title: {
    template: "%s · Les Cimes",
    default: "Mon compte",
  },
  description: "Gérez vos réservations et votre profil Les Cimes.",
};

// Layout de l'espace connecté : en-tête personnalisé + onglets
// (l'accès est protégé par proxy.ts)
export default async function CompteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <div className="container-page py-10 sm:py-14">
      <header className="mb-6">
        <p className="text-ink-500">Mon compte</p>
        <h1 className="text-3xl font-bold sm:text-4xl">Bonjour {session?.prenom} <span aria-hidden="true">👋</span>
        </h1>
      </header>
      <AccountNav />
      <div className="pt-8">{children}</div>
    </div>
  );
}

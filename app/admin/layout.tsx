import type { Metadata } from "next";

export const metadata: Metadata = {
  // Un layout qui définit son propre titre doit redéclarer le template
  // pour que ses pages enfants gardent le suffixe " · Les Cimes"
  title: {
    template: "%s · Les Cimes",
    default: "Administration",
  },
  description: "Gestion des activités du parc Les Cimes.",
  robots: { index: false }, // le back-office n'a rien à faire dans les moteurs de recherche
};

// Layout du back-office (accès réservé aux admins par proxy.ts)
export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="container-page py-10 sm:py-14">{children}</div>;
}

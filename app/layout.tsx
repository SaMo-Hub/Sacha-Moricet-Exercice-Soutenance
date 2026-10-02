import type { Metadata } from "next";
import "./globals.css";
import { outfit, rethinkSans } from "@/fonts/fonts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Metadata par défaut : chaque page définit son propre titre,
// inséré à la place de %s
export const metadata: Metadata = {
  title: {
    template: "%s · Les Cimes",
    default: "Les Cimes · Parc d'aventure en forêt",
  },
  description:
    "Accrobranche, escalade, canyoning, kayak : réservez vos activités au parc d'aventure Les Cimes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${outfit.variable} ${rethinkSans.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        {/* Lien d'évitement pour la navigation au clavier */}
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2"
        >
          Aller au contenu
        </a>
        <Header />
        <main id="contenu" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

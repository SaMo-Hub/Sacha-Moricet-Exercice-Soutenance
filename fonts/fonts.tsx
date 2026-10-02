import { Outfit, Rethink_Sans } from "next/font/google";

// Police des titres : géométrique et chaleureuse
export const outfit = Outfit({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--outfit",
});

// Police du texte courant : très lisible en petite taille
export const rethinkSans = Rethink_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--rethink-sans",
});

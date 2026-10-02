import Link from "next/link";
import { Suspense } from "react";
import SearchBar from "./SearchBar";
import { ArrowRightIcon } from "./Icons";

// Bandeau d'accueil : promesse, recherche et appel à l'action principal
export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-forest-900 text-white">
      {/* Décor : soleil (hors du SVG étiré, pour rester rond) et lignes de crêtes */}
      <div
        className="pointer-events-none absolute bottom-24 right-[12%] h-16 w-16 rounded-full bg-sun-500 opacity-90 sm:bottom-36 sm:h-20 sm:w-20"
        aria-hidden="true"
      />
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full sm:h-56"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 150 180 70l140 80 160-110 200 120 170-90 190 100 200-120 200 120v70H0Z" fill="var(--color-forest-800)" />
        <path d="M0 190 140 130l170 60 210-90 180 80 220-70 200 70 160-50 160 60v30H0Z" fill="var(--color-forest-700)" />
        <path d="M0 220v-20l240-30 220 30 260-40 240 40 260-30 220 30v20Z" fill="var(--color-sand-50)" />
      </svg>

      <div className="container-page relative pb-36 pt-14 sm:pb-48 sm:pt-20">
        <p className="badge bg-white/10 text-forest-100">Saison d&apos;automne · ouvert tous les jours</p>
        <h1 className="mt-4 max-w-2xl text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
          Réservez votre prochaine aventure en forêt
        </h1>
        <p className="mt-4 max-w-xl text-lg text-forest-100">
          Accrobranche, escalade, canyoning ou yoga dans les arbres : choisissez un créneau,
          réservez en un clic, on s&apos;occupe du reste.
        </p>

        <div className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
          <div className="flex-1 text-ink-900">
            {/* useSearchParams (dans SearchBar) doit être encadré par Suspense */}
            <Suspense>
              <SearchBar placeholder="Accrobranche, kayak…" />
            </Suspense>
          </div>
          <Link href="/activites" className="btn h-14 rounded-2xl bg-sun-500 px-6 text-forest-900 hover:bg-sun-400 focus-visible:outline-white">
            Toutes les activités
            <ArrowRightIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}

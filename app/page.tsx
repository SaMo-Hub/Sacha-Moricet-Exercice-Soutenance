import Link from "next/link";
import { Suspense } from "react";
import Hero from "@/components/Hero";
import Activities from "@/components/Activities";
import ActivitiesLoader from "@/components/ActivitiesLoader";
import FlashMessage from "@/components/FlashMessage";
import { ArrowRightIcon } from "@/components/Icons";

// Page d'accueil : hérite du titre par défaut défini dans app/layout.tsx

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  // Message éventuel après une redirection (ex. compte supprimé)
  const { message } = await searchParams;

  return (
    <>
      <Hero />

      <section className="container-page py-12 sm:py-16" aria-labelledby="prochainement">
        {message && (
          <div className="mb-8">
            <FlashMessage code={message} />
          </div>
        )}

        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 id="prochainement" className="text-2xl font-bold sm:text-3xl">
              Prochainement au parc
            </h2>
            <p className="mt-1 text-ink-500">Les créneaux des prochains jours, places en temps réel.</p>
          </div>
          <Link href="/activites" className="btn btn-ghost hidden sm:inline-flex">
            Tout voir <ArrowRightIcon />
          </Link>
        </div>

        {/* Streaming : la page s'affiche tout de suite, les activités dès qu'elles sont prêtes */}
        <Suspense fallback={<ActivitiesLoader />}>
          <Activities limit={6} />
        </Suspense>

        <Link href="/activites" className="btn btn-secondary btn-block mt-6 sm:hidden">
          Voir toutes les activités
        </Link>
      </section>
    </>
  );
}

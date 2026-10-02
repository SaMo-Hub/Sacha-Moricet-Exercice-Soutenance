import type { Metadata } from "next";
import { Suspense } from "react";
import Activities from "@/components/Activities";
import ActivitiesLoader from "@/components/ActivitiesLoader";
import SearchBar from "@/components/SearchBar";
import TypeFilter from "@/components/TypeFilter";

export const metadata: Metadata = {
  title: "Activités",
  description:
    "Toutes les activités à venir du parc Les Cimes : recherchez par nom, filtrez par type et réservez votre créneau.",
};

export default async function ActivitiesPage({
  // Récupération des paramètres de l'URL (?q=...&type=...)
  searchParams,
}: {
  // Typage des paramètres de l'URL
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const { q = "", type } = await searchParams;
  const typeId = Number(type) || undefined;

  return (
    <div className="container-page py-10 sm:py-14">
      <header className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold sm:text-4xl">Activités</h1>
        <p className="mt-2 text-lg text-ink-500">
          Trouvez le créneau qui vous ressemble, du parcours en hauteur à la balade en kayak.
        </p>
      </header>

      <div className="mb-8 flex flex-col gap-4">
        <div className="max-w-xl">
          {/* useSearchParams (dans SearchBar) doit être encadré par Suspense */}
          <Suspense>
            <SearchBar />
          </Suspense>
        </div>
        <Suspense fallback={<div className="h-10" />}>
          <TypeFilter activeTypeId={typeId} search={q} />
        </Suspense>
      </div>

      {/* La clé force un nouveau chargement (et le squelette) à chaque recherche */}
      <Suspense key={`${q}-${typeId}`} fallback={<ActivitiesLoader />}>
        <Activities search={q} typeId={typeId} />
      </Suspense>
    </div>
  );
}

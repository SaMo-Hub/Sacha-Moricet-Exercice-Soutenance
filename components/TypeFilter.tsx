import Link from "next/link";
import clsx from "clsx";
import { getActivityTypes } from "@/actions/GetActivityTypes";
import { ActivityType } from "@/types/ActivityType";

type TypeFilterProps = {
  activeTypeId?: number;
  search?: string; // conservé dans les liens pour combiner recherche et filtre
};

// Filtres par type d'activité, sous forme de liens (fonctionnent sans JavaScript)
export default async function TypeFilter({ activeTypeId, search }: TypeFilterProps) {
  const response = await getActivityTypes();
  if (!response.ok || response.status >= 300) return null;
  const types: ActivityType[] = await response.json();

  // Construit l'URL d'un filtre en gardant la recherche en cours
  const href = (typeId?: number) => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (typeId) params.set("type", String(typeId));
    const query = params.toString();
    return query ? `/activites?${query}` : "/activites";
  };

  return (
    <nav aria-label="Filtrer par type" className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      <ul className="flex gap-2 sm:flex-wrap">
        <li>
          <Link
            href={href()}
            scroll={false}
            className={clsx("chip", { active: !activeTypeId })}
            aria-current={!activeTypeId ? "page" : undefined}
          >
            Toutes
          </Link>
        </li>
        {types.map((type) => (
          <li key={type.id}>
            <Link
              href={href(type.id)}
              scroll={false}
              className={clsx("chip", { active: activeTypeId === type.id })}
              aria-current={activeTypeId === type.id ? "page" : undefined}
            >
              {type.nom}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

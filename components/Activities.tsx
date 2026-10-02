import { getActivities } from "@/actions/GetActivities";
import { Activity } from "@/types/Activity";
import ActivityCard from "./ActivityCard";
import EmptyState from "./EmptyState";
import Link from "next/link";
import { AlertIcon, SearchIcon } from "./Icons";
import RetryButton from "./RetryButton";

type ActivitiesProps = {
  search?: string;
  typeId?: number;
  limit?: number;
};

// Liste des activités à venir, chargée côté serveur (streaming avec Suspense)
export default async function Activities({ search, typeId, limit }: ActivitiesProps) {
  const response = await getActivities({ search, typeId, limit }); // Call action

  // Erreur de chargement : on l'explique et on propose de réessayer (jamais d'impasse)
  if (!response.ok || response.status >= 300) {
    return (
      <EmptyState
        icon={<AlertIcon size={22} />}
        title="Impossible de charger les activités"
        description="Le programme du parc n'a pas pu être récupéré. Réessayez dans un instant."
        action={<RetryButton />}
      />
    );
  }

  const activities: Activity[] = await response.json();

  // Aucun résultat : on explique et on propose de réinitialiser la recherche
  if (activities.length === 0) {
    return (
      <EmptyState
        icon={<SearchIcon size={22} />}
        title="Aucune activité trouvée"
        description={
          search
            ? `Aucune activité à venir ne correspond à « ${search} ».`
            : typeId
              ? "Aucune activité de ce type n'est programmée pour le moment."
              : "Aucune activité n'est programmée pour le moment."
        }
        action={
          (search || typeId) && (
            <Link href="/activites" className="btn btn-secondary">
              Voir toutes les activités
            </Link>
          )
        }
      />
    );
  }

  return (
    <div>
      {search !== undefined && (
        <p className="mb-4 text-sm text-ink-500" aria-live="polite">
          {activities.length} activité{activities.length > 1 ? "s" : ""} à venir
        </p>
      )}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activities.map((activity) => (
          <li key={activity.id} className="flex [&>article]:flex-1">
            <ActivityCard activity={activity} />
          </li>
        ))}
      </ul>
    </div>
  );
}

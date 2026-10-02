import Link from "next/link";
import { getActivities } from "@/actions/GetActivities";
import { Activity } from "@/types/Activity";
import AdminActivities from "@/components/AdminActivities";
import FlashMessage from "@/components/FlashMessage";
import EmptyState from "@/components/EmptyState";
import RetryButton from "@/components/RetryButton";
import { AlertIcon, PlusIcon, ShieldIcon } from "@/components/Icons";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams; // message après création / modification

  // Toutes les activités, passées comprises
  const response = await getActivities({ upcomingOnly: false, limit: 500 });
  // Erreur de chargement : explication + possibilité de réessayer
  if (!response.ok || response.status >= 300) {
    return (
      <EmptyState
        icon={<AlertIcon size={22} />}
        title="Impossible de charger les activités"
        description="La liste des activités n'a pas pu être récupérée. Réessayez dans un instant."
        action={<RetryButton />}
      />
    );
  }
  const activities: Activity[] = await response.json();

  return (
    <>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-forest-700">
            <ShieldIcon size={16} /> Administration
          </p>
          <h1 className="mt-1 text-3xl font-bold sm:text-4xl">Activités du parc</h1>
          <p className="mt-1 text-ink-500">
            <span className="tabular-nums">{activities.length}</span> activité
            {activities.length > 1 ? "s" : ""} programmée{activities.length > 1 ? "s" : ""}, passées
            comprises.
          </p>
        </div>
        <Link href="/admin/activites/nouvelle" className="btn btn-primary">
          <PlusIcon /> Nouvelle activité
        </Link>
      </header>

      {message && (
        <div className="mb-6">
          <FlashMessage code={message} />
        </div>
      )}

      <AdminActivities initialActivities={activities} />
    </>
  );
}

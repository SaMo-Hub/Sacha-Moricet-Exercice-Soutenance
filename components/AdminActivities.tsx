"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import clsx from "clsx";
import { Activity } from "@/types/Activity";
import { formatDuree, formatShortDate, formatTime, isPast } from "@/utils/dates";
import ConfirmButton from "./ConfirmButton";
import EmptyState from "./EmptyState";
import FormMessage from "./FormMessage";
import { PencilIcon, PlusIcon, TrashIcon } from "./Icons";

// Liste des activités du back-office.
// Les données initiales viennent du serveur, la suppression se fait côté client
// (appel à l'API puis mise à jour du state, sans rechargement).
export default function AdminActivities({ initialActivities }: { initialActivities: Activity[] }) {
  const [activities, setActivities] = useState(initialActivities);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  // Zone des messages : reçoit le focus après une suppression, car la ligne
  // (et donc le bouton cliqué) disparaît de la liste
  const messagesRef = useRef<HTMLDivElement>(null);

  // Execute deletion
  const deleteActivity = async (activity: Activity) => {
    setDeletingId(activity.id as number);
    setError("");
    setSuccess("");

    try {
      // Call API with DELETE method
      const response = await fetch(`/api/activities/delete/${activity.id}`, {
        method: "DELETE",
      });

      if (!response.ok || response.status >= 300) {
        const { message } = await response.json();
        setError(message ?? "Une erreur est survenue");
        setDeletingId(null);
        return;
      }
    } catch (error) {
      // Réseau coupé ou réponse illisible : le bouton ne doit pas rester bloqué
      console.error(error);
      setError("La suppression n'a pas abouti, vérifiez votre connexion puis réessayez.");
      setDeletingId(null);
      return;
    }

    // Update state with filter method to delete the row
    setActivities((prevList) => prevList.filter((a) => a.id !== activity.id));
    setSuccess(`« ${activity.nom} » a été supprimée.`);
    setDeletingId(null);
    // Après le rendu du message, on y place le focus (lu par les lecteurs d'écran)
    requestAnimationFrame(() => messagesRef.current?.focus());
  };

  if (activities.length === 0) {
    return (
      <EmptyState
        title="Aucune activité"
        description="Créez la première activité du parc pour ouvrir les réservations."
        action={
          <Link href="/admin/activites/nouvelle" className="btn btn-primary">
            <PlusIcon /> Nouvelle activité
          </Link>
        }
      />
    );
  }

  // À venir d'abord (la plus proche en haut), puis les passées (la plus récente en haut) :
  // l'admin arrive directement sur ce qui demande son attention
  const upcoming = activities.filter((a) => !isPast(a.datetime_debut));
  const pastActivities = activities.filter((a) => isPast(a.datetime_debut)).reverse();

  // Ligne d'une activité dans la liste
  const renderRow = (activity: Activity) => {
    const reserved = activity.places_reservees ?? 0;
    const past = isPast(activity.datetime_debut);
    const full = reserved >= activity.places_disponibles;

    return (
      <li
        key={activity.id}
        className={clsx("flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-6 sm:px-5", {
          "bg-sand-50/70": past,
        })}
      >
        {/* Date */}
        <div className="w-24 shrink-0 text-sm">
          <p className="font-semibold text-forest-900">{formatShortDate(activity.datetime_debut)}</p>
          <p className="text-ink-500">{formatTime(activity.datetime_debut)} · {formatDuree(activity.duree)}</p>
        </div>

        {/* Nom et type */}
        <div className="min-w-0 flex-1">
          <Link href={`/activites/${activity.id}`} className="font-semibold hover:underline">
            {activity.nom}
          </Link>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <span className="badge badge-neutral">{activity.type_nom}</span>
            {past && <span className="badge badge-neutral">Passée</span>}
            {!past && full && <span className="badge badge-danger">Complet</span>}
          </div>
        </div>

        {/* Remplissage */}
        <p className="text-sm tabular-nums text-ink-500 sm:w-28 sm:text-right">
          <strong className="text-ink-900">{reserved}</strong> / {activity.places_disponibles} places
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/admin/activites/${activity.id}/modifier`}
            className="btn btn-secondary btn-sm"
            aria-label={`Modifier ${activity.nom}`}
          >
            <PencilIcon size={15} /> Modifier
          </Link>
          <ConfirmButton
            className="btn btn-danger-outline btn-sm"
            ariaLabel={`Supprimer ${activity.nom}`}
            disabled={deletingId === activity.id}
            title="Supprimer cette activité ?"
            description={
              <p>
                <strong>{activity.nom}</strong> sera définitivement supprimée
                {reserved > 0 && (
                  <>, ainsi que ses <strong>{reserved} réservation{reserved > 1 ? "s" : ""} active{reserved > 1 ? "s" : ""}</strong></>
                )}
                .
              </p>
            }
            confirmLabel="Supprimer"
            onConfirm={() => deleteActivity(activity)}
          >
            <TrashIcon size={15} />
            <span className="sr-only sm:not-sr-only">
              {deletingId === activity.id ? "Suppression…" : "Supprimer"}
            </span>
          </ConfirmButton>
        </div>
      </li>
    );
  };

  return (
    <div className="flex flex-col gap-10">
      <div
        ref={messagesRef}
        tabIndex={-1}
        aria-live="polite"
        className="flex flex-col gap-3 outline-none empty:hidden"
      >
        {error && <FormMessage message={error} />}
        {success && <FormMessage type="success" message={success} />}
      </div>

      <section aria-labelledby="admin-a-venir">
        <h2 id="admin-a-venir" className="mb-4 text-xl font-semibold">
          À venir <span className="text-ink-500">({upcoming.length})</span>
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-ink-500">Aucune activité à venir : les réservations sont fermées.</p>
        ) : (
          <ul className="card divide-y divide-sand-200 overflow-hidden">{upcoming.map(renderRow)}</ul>
        )}
      </section>

      {pastActivities.length > 0 && (
        <section aria-labelledby="admin-passees">
          <h2 id="admin-passees" className="mb-4 text-xl font-semibold">
            Passées <span className="text-ink-500">({pastActivities.length})</span>
          </h2>
          <ul className="card divide-y divide-sand-200 overflow-hidden">
            {pastActivities.map(renderRow)}
          </ul>
        </section>
      )}
    </div>
  );
}

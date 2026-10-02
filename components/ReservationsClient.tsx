"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Reservation } from "@/types/Reservation";
import { formatDateTime, formatDuree, isPast } from "@/utils/dates";
import ConfirmButton from "./ConfirmButton";
import EmptyState from "./EmptyState";
import FormMessage from "./FormMessage";
import { AlertIcon, ClockIcon, TicketIcon } from "./Icons";

// Mutation côté client (cf. cours) : la liste est gardée dans un state,
// l'annulation appelle l'API puis met à jour le state sans recharger la page
export default function ReservationsClient() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [loadError, setLoadError] = useState(false); // échec du chargement initial
  const [reloadKey, setReloadKey] = useState(0); // incrémenté par "Réessayer"
  // Zone des messages : reçoit le focus après une annulation, car le bouton
  // cliqué disparaît (la réservation passe dans "Annulées")
  const messagesRef = useRef<HTMLDivElement>(null);

  // Execute cancellation
  const cancelReservation = async (reservation: Reservation) => {
    setCancellingId(reservation.id as number);
    setError("");
    setSuccess("");

    try {
      // Call API with PATCH method
      const response = await fetch(`/api/reservations/cancel/${reservation.id}`, {
        method: "PATCH",
      });

      if (!response.ok || response.status >= 300) {
        const { message } = await response.json();
        setError(message ?? "Une erreur est survenue");
        setCancellingId(null);
        return;
      }
    } catch (error) {
      // Réseau coupé ou réponse illisible : le bouton ne doit pas rester bloqué
      console.error(error);
      setError("L'annulation n'a pas abouti, vérifiez votre connexion puis réessayez.");
      setCancellingId(null);
      return;
    }

    // Update state : la réservation passe à l'état annulé (etat = 0)
    setReservations((prevList) =>
      prevList.map((r) => (r.id === reservation.id ? { ...r, etat: 0 } : r))
    );
    setSuccess(`Votre réservation pour « ${reservation.activite_nom} » est annulée.`);
    setCancellingId(null);
    // Après le rendu du message, on y place le focus (lu par les lecteurs d'écran)
    requestAnimationFrame(() => messagesRef.current?.focus());
  };

  // Bouton "Réessayer" de l'état d'erreur : relance le chargement
  const retry = () => {
    setLoadError(false);
    setIsLoading(true);
    setReloadKey((key) => key + 1);
  };

  // Chargement des réservations au montage du composant
  useEffect(() => {
    const getReservations = async () => {
      try {
        const response = await fetch("/api/reservations");

        if (!response.ok || response.status >= 300) {
          setLoadError(true);
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        // We need to keep in state the data only, not the HTML to easily update the rows later
        setReservations(data.response);
      } catch (error) {
        // Sans ce catch, une coupure réseau laisserait le squelette tourner indéfiniment
        console.error(error);
        setLoadError(true);
      }
      setIsLoading(false);
    };

    getReservations();
  }, [reloadKey]);

  if (isLoading) {
    return (
      // loader-delayed : le squelette n'apparaît que si le chargement dépasse 300 ms
      <div className="loader-delayed flex flex-col gap-3" aria-busy="true">
        <span className="sr-only">Chargement des réservations…</span>
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-24 rounded-2xl" aria-hidden="true" />
        ))}
      </div>
    );
  }

  // Répartition en trois groupes
  const upcoming = reservations.filter((r) => r.etat && !isPast(r.datetime_debut as string));
  const past = reservations.filter((r) => r.etat && isPast(r.datetime_debut as string));
  const cancelled = reservations.filter((r) => !r.etat);

  // Échec du chargement : surtout ne pas afficher "Aucune réservation", ce serait faux
  if (loadError) {
    return (
      <EmptyState
        icon={<AlertIcon size={22} />}
        title="Impossible de charger vos réservations"
        description="Vos réservations sont bien enregistrées, mais elles n'ont pas pu être affichées. Vérifiez votre connexion puis réessayez."
        action={
          <button type="button" className="btn btn-secondary" onClick={retry}>
            Réessayer
          </button>
        }
      />
    );
  }

  if (reservations.length === 0) {
    return (
      <EmptyState
        icon={<TicketIcon size={22} />}
        title="Aucune réservation pour l'instant"
        description="Parcourez les activités du parc et réservez votre premier créneau."
        action={
          <Link href="/activites" className="btn btn-primary">
            Découvrir les activités
          </Link>
        }
      />
    );
  }

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

      <section aria-labelledby="a-venir">
        <h2 id="a-venir" className="mb-4 text-xl font-semibold">
          À venir <span className="text-ink-500">({upcoming.length})</span>
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-ink-500">
            Rien de prévu.{" "}
            <Link href="/activites" className="font-semibold text-forest-700 underline underline-offset-2">
              Trouver une activité
            </Link>
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {upcoming.map((reservation) => (
              <ReservationRow key={reservation.id} reservation={reservation}>
                <ConfirmButton
                  className="btn btn-danger-outline btn-sm"
                  disabled={cancellingId === reservation.id}
                  title="Annuler cette réservation ?"
                  description={
                    <p>
                      Votre place pour <strong>{reservation.activite_nom}</strong> sera libérée et
                      proposée à d&apos;autres visiteurs.
                    </p>
                  }
                  confirmLabel="Annuler la réservation"
                  cancelLabel="Garder ma place"
                  onConfirm={() => cancelReservation(reservation)}
                >
                  {cancellingId === reservation.id ? "Annulation…" : "Annuler"}
                </ConfirmButton>
              </ReservationRow>
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 && (
        <section aria-labelledby="passees">
          <h2 id="passees" className="mb-4 text-xl font-semibold">
            Passées <span className="text-ink-500">({past.length})</span>
          </h2>
          <ul className="flex flex-col gap-3">
            {past.map((reservation) => (
              <ReservationRow key={reservation.id} reservation={reservation} muted>
                <span className="badge badge-neutral">Terminée</span>
              </ReservationRow>
            ))}
          </ul>
        </section>
      )}

      {cancelled.length > 0 && (
        <section aria-labelledby="annulees">
          <h2 id="annulees" className="mb-4 text-xl font-semibold">
            Annulées <span className="text-ink-500">({cancelled.length})</span>
          </h2>
          <ul className="flex flex-col gap-3">
            {cancelled.map((reservation) => (
              <ReservationRow key={reservation.id} reservation={reservation} muted>
                <span className="badge badge-danger">Annulée</span>
              </ReservationRow>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

// Ligne d'une réservation ; children = action ou statut affiché à droite
function ReservationRow({
  reservation,
  muted = false,
  children,
}: {
  reservation: Reservation;
  muted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <li
      className={clsx(
        "card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5",
        { "bg-white/60 shadow-none": muted }
      )}
    >
      <div className="min-w-0">
        <span className={clsx("badge", { "badge-neutral": muted })}>{reservation.type_nom}</span>
        <h3 className={clsx("mt-1.5 text-lg font-semibold", { "text-ink-700": muted })}>
          <Link href={`/activites/${reservation.activite_id}`} className="hover:underline">
            {reservation.activite_nom}
          </Link>
        </h3>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-500 first-letter:uppercase">
          <ClockIcon size={15} />
          <span className="first-letter:uppercase">
            {formatDateTime(reservation.datetime_debut as string)} · {formatDuree(reservation.duree as number)}
          </span>
        </p>
      </div>
      <div className="shrink-0">{children}</div>
    </li>
  );
}

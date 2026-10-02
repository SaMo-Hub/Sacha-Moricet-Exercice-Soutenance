"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CreateReservation } from "@/actions/CreateReservation";
import { ReservationError } from "@/types/FormState";
import FormMessage from "./FormMessage";
import { CheckIcon, TicketIcon } from "./Icons";

// Situation de l'utilisateur face à l'activité, calculée par la page serveur
export type ReservationStatus = "available" | "full" | "past" | "reserved" | "guest";

type ReservationFormProps = {
  activityId: number;
  status: ReservationStatus;
};

export default function ReservationForm({ activityId, status }: ReservationFormProps) {
  const initialState: ReservationError = { message: null };
  // L'id de l'activité est lié à l'action : le formulaire n'a aucun champ à envoyer
  const [state, formAction, isPending] = useActionState<ReservationError, FormData>(
    CreateReservation.bind(null, activityId),
    initialState
  );

  // Déjà réservée : on confirme et on renvoie vers la liste des réservations
  if (status === "reserved") {
    return (
      <div className="flex flex-col gap-3">
        <FormMessage
          type="success"
          message={state.success ? state.message : "Vous avez une place réservée pour ce créneau."}
        />
        <Link href="/mon-compte/reservations" className="btn btn-secondary btn-block">
          <TicketIcon /> Voir mes réservations
        </Link>
      </div>
    );
  }

  // Visiteur non connecté : on l'envoie se connecter puis revenir ici
  if (status === "guest") {
    return (
      <div className="flex flex-col gap-3">
        <Link
          href={`/login?redirect=/activites/${activityId}`}
          className="btn btn-primary btn-block"
        >
          Se connecter pour réserver
        </Link>
        <p className="text-center text-sm text-ink-500">
          Pas encore de compte ?{" "}
          <Link href="/register" className="font-semibold text-forest-700 underline underline-offset-2">
            Inscrivez-vous
          </Link>
        </p>
      </div>
    );
  }

  // Activité passée ou complète : bouton désactivé + explication
  if (status === "past" || status === "full") {
    return (
      <div className="flex flex-col gap-3">
        <button type="button" className="btn btn-primary btn-block" disabled>
          {status === "full" ? "Complet" : "Activité terminée"}
        </button>
        <p className="text-center text-sm text-ink-500">
          {status === "full"
            ? "Toutes les places sont prises. Une place peut se libérer en cas d'annulation."
            : "Ce créneau est passé, découvrez les prochaines activités."}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <button type="submit" className="btn btn-primary btn-block h-12" disabled={isPending}>
        {isPending ? (
          "Réservation en cours…"
        ) : (
          <>
            <CheckIcon /> Réserver une place
          </>
        )}
      </button>
      {/* Erreur renvoyée par l'action (complet entre-temps, déjà réservée...) */}
      {!state.success && <FormMessage message={state.message} />}
      <p className="text-center text-sm text-ink-500">Annulation gratuite jusqu&apos;au début de l&apos;activité.</p>
    </form>
  );
}

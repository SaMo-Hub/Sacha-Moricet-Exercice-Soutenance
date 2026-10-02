import type { Metadata } from "next";
import ReservationsClient from "@/components/ReservationsClient";

export const metadata: Metadata = {
  title: "Mes réservations",
  description: "Retrouvez et annulez vos réservations d'activités.",
};

// La liste est gérée côté client : l'annulation met la page à jour en direct
export default function Reservations() {
  return <ReservationsClient />;
}

import { redirect } from "next/navigation";

// /mon-compte n'a pas de contenu propre : on ouvre directement les réservations
export default function MonCompte() {
  redirect("/mon-compte/reservations");
}

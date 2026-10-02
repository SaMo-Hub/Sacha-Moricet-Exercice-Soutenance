import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/actions/GetUser";
import { User } from "@/types/User";
import ProfileForm from "@/components/ProfileForm";
import DeleteAccount from "@/components/DeleteAccount";

export const metadata: Metadata = {
  title: "Mon profil",
  description: "Modifiez vos informations personnelles ou supprimez votre compte.",
};

export default async function Profil() {
  const response = await getUser(); // Call action

  // Session invalide ou compte supprimé : retour à la connexion
  if (!response.ok || response.status >= 300) {
    redirect("/login");
  }

  const user: User = await response.json();

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <section className="card p-6 sm:p-8" aria-labelledby="infos">
        <h2 id="infos" className="text-xl font-semibold">Informations personnelles</h2>
        <p className="mb-6 mt-1 text-ink-500">
          Ces informations sont utilisées pour vos réservations.
        </p>
        <ProfileForm user={user} />
      </section>

      <section className="card border-danger-200 p-6 sm:p-8" aria-labelledby="danger">
        <h2 id="danger" className="text-xl font-semibold">Supprimer mon compte</h2>
        <p className="mb-6 mt-1 text-ink-500">
          Vos données et vos réservations seront effacées. Cette action ne peut pas être annulée.
        </p>
        <DeleteAccount />
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getActivity } from "@/actions/GetActivity";
import { getUserReservation } from "@/actions/GetUserReservation";
import { getSession } from "@/utils/sessions";
import { formatDateTime, formatDuree, isPast } from "@/utils/dates";
import { Activity } from "@/types/Activity";
import PlacesIndicator from "@/components/PlacesIndicator";
import ReservationForm, { ReservationStatus } from "@/components/ReservationForm";
import { ArrowLeftIcon, CalendarIcon, ClockIcon, PencilIcon, UsersIcon } from "@/components/Icons";

// Typage des paramètres d'URL
type Props = {
  params: Promise<{ id: string }>;
};

// Récupère l'activité ou affiche la page 404 si elle n'existe pas
async function findActivity(id: string) {
  const response = await getActivity(Number(id));
  if (!response.ok || response.status >= 300) notFound();
  const activity: Activity = await response.json();
  return activity;
}

// Metadata dynamiques : le titre et la description reprennent l'activité
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const response = await getActivity(Number((await params).id));
  if (!response.ok || response.status >= 300) {
    return { title: "Activité introuvable" };
  }
  const activity: Activity = await response.json();
  return {
    title: activity.nom,
    description: `${activity.type_nom} · ${formatDateTime(activity.datetime_debut)} · ${activity.description.slice(0, 140)}`,
  };
}

export default async function ActivityPage({ params }: Props) {
  // Récupération de l'id parmi les paramètres d'URL
  const id = (await params).id;
  const activity = await findActivity(id);
  const session = await getSession();

  const reserved = activity.places_reservees ?? 0;
  const remaining = activity.places_disponibles - reserved;

  // Situation de l'utilisateur, par ordre de priorité
  let status: ReservationStatus = "available";
  if (session) {
    const reservationResponse = await getUserReservation(activity.id as number);
    const reservation = await reservationResponse.json();
    if (reservation) status = "reserved";
  }
  if (status !== "reserved") {
    if (isPast(activity.datetime_debut)) status = "past";
    else if (remaining <= 0) status = "full";
    else if (!session) status = "guest";
  }

  // Informations clés de l'activité
  const facts = [
    { icon: <CalendarIcon />, label: "Date", value: formatDateTime(activity.datetime_debut) },
    { icon: <ClockIcon />, label: "Durée", value: formatDuree(activity.duree) },
    { icon: <UsersIcon />, label: "Capacité", value: `${activity.places_disponibles} personnes` },
  ];

  return (
    <div className="container-page py-8 sm:py-12">
      <Link href="/activites" className="btn btn-ghost -ml-3 mb-6">
        <ArrowLeftIcon /> Toutes les activités
      </Link>

      {/* Ordre mobile : infos clés → réservation → description, pour que l'action principale
          ne soit pas sous une longue description. Sur grand écran, l'encart passe à droite
          sur les deux lignes de la grille. */}
      <article className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:gap-y-10">
        <header className="lg:col-start-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge">{activity.type_nom}</span>
            {status === "past" && <span className="badge badge-neutral">Terminée</span>}
          </div>
          <h1 className="mt-3 text-3xl font-bold sm:text-5xl">{activity.nom}</h1>

          <dl className="mt-8 grid gap-3 sm:grid-cols-3">
            {facts.map((fact) => (
              <div key={fact.label} className="card flex items-start gap-3 p-4">
                <span className="mt-0.5 text-forest-600">{fact.icon}</span>
                <div>
                  <dt className="text-sm text-ink-500">{fact.label}</dt>
                  <dd className="font-semibold first-letter:uppercase">{fact.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </header>

        {/* Encart de réservation : reste visible au défilement sur grand écran */}
        <aside className="lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          <div className="card flex flex-col gap-5 p-6">
            <h2 className="text-lg font-semibold">Réserver ce créneau</h2>
            <PlacesIndicator total={activity.places_disponibles} reserved={reserved} size="lg" />
            <ReservationForm activityId={activity.id as number} status={status} />
          </div>

          {/* Raccourci de modification pour les administrateurs */}
          {session?.role === "admin" && (
            <Link
              href={`/admin/activites/${activity.id}/modifier`}
              className="btn btn-ghost btn-block mt-3"
            >
              <PencilIcon size={16} /> Modifier l&apos;activité
            </Link>
          )}
        </aside>

        <section className="lg:col-start-1" aria-labelledby="programme">
          <h2 id="programme" className="text-xl font-semibold">Au programme</h2>
          <p className="mt-3 max-w-prose whitespace-pre-line text-lg text-ink-700">
            {activity.description}
          </p>
        </section>
      </article>
    </div>
  );
}

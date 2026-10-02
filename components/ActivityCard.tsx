import Link from "next/link";
import { Activity } from "@/types/Activity";
import { formatDuree, formatTime } from "@/utils/dates";
import { ClockIcon } from "./Icons";
import PlacesIndicator from "./PlacesIndicator";

// Carte d'une activité dans les listes : toute la carte est cliquable
export default function ActivityCard({ activity }: { activity: Activity }) {
  // Date découpée pour le bloc "calendrier" : jour et mois
  const date = new Date(`${activity.datetime_debut.slice(0, 10)}T00:00:00Z`);
  const day = date.getUTCDate();
  const month = date.toLocaleDateString("fr-FR", { month: "short", timeZone: "UTC" });
  const weekday = date.toLocaleDateString("fr-FR", { weekday: "short", timeZone: "UTC" });

  return (
    // has-[a:focus-visible] : au clavier, c'est toute la carte (la zone cliquable) qui porte le focus
    <article className="card group relative flex flex-col gap-4 p-5 transition-[box-shadow,border-color] duration-200 hover:border-sand-300 hover:shadow-lift has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-forest-600">
      <div className="flex items-start gap-4">
        {/* Bloc calendrier */}
        <div className="flex w-14 shrink-0 flex-col items-center rounded-xl bg-forest-50 py-2 text-forest-700">
          <span className="text-[0.6875rem] font-semibold uppercase tracking-wide">
            {weekday.replace(".", "")}
          </span>
          <span className="font-display text-2xl font-bold leading-none">{day}</span>
          <span className="text-xs font-medium">{month.replace(".", "")}</span>
        </div>

        <div className="min-w-0 flex-1">
          <span className="badge">{activity.type_nom}</span>
          <h3 className="mt-2 text-lg font-semibold">
            {/* Le lien s'étend à toute la carte grâce au pseudo-élément */}
            <Link
              href={`/activites/${activity.id}`}
              className="rounded outline-none after:absolute after:inset-0 after:rounded-[1.25rem] after:content-['']"
            >
              {activity.nom}
            </Link>
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
            <ClockIcon size={15} />
            {formatTime(activity.datetime_debut)} · {formatDuree(activity.duree)}
          </p>
        </div>
      </div>

      <p className="line-clamp-2 text-sm text-ink-700">{activity.description}</p>

      <div className="mt-auto">
        <PlacesIndicator
          total={activity.places_disponibles}
          reserved={activity.places_reservees ?? 0}
        />
      </div>
    </article>
  );
}

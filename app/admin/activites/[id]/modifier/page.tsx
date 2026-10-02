import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getActivity } from "@/actions/GetActivity";
import { getActivityTypes } from "@/actions/GetActivityTypes";
import { Activity } from "@/types/Activity";
import { ActivityType } from "@/types/ActivityType";
import ActivityForm from "@/components/ActivityForm";
import { ArrowLeftIcon } from "@/components/Icons";

// Typage des paramètres d'URL
type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const response = await getActivity(Number((await params).id));
  if (!response.ok) return { title: "Activité introuvable" };
  const activity: Activity = await response.json();
  return { title: `Modifier « ${activity.nom} »` };
}

export default async function EditActivity({ params }: Props) {
  // Récupération de l'id parmi les paramètres d'URL
  const id = Number((await params).id);

  // L'activité et les types sont chargés en parallèle
  const [activityResponse, typesResponse] = await Promise.all([getActivity(id), getActivityTypes()]);

  if (!activityResponse.ok || activityResponse.status >= 300) notFound();

  const activity: Activity = await activityResponse.json();
  const types: ActivityType[] = typesResponse.ok ? await typesResponse.json() : [];

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin" className="btn btn-ghost -ml-3 mb-4">
        <ArrowLeftIcon /> Retour aux activités
      </Link>
      <h1 className="mb-6 text-3xl font-bold">Modifier l&apos;activité</h1>
      <div className="card p-6 sm:p-8">
        <ActivityForm types={types} activity={activity} />
      </div>
    </div>
  );
}

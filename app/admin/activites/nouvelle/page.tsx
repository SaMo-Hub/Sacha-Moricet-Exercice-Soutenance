import type { Metadata } from "next";
import Link from "next/link";
import { getActivityTypes } from "@/actions/GetActivityTypes";
import { ActivityType } from "@/types/ActivityType";
import ActivityForm from "@/components/ActivityForm";
import { ArrowLeftIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Nouvelle activité",
};

export default async function NewActivity() {
  const response = await getActivityTypes();
  const types: ActivityType[] = response.ok ? await response.json() : [];

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin" className="btn btn-ghost -ml-3 mb-4">
        <ArrowLeftIcon /> Retour aux activités
      </Link>
      <h1 className="mb-6 text-3xl font-bold">Nouvelle activité</h1>
      <div className="card p-6 sm:p-8">
        <ActivityForm types={types} />
      </div>
    </div>
  );
}

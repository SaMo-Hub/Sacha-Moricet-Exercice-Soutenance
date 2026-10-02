"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CreateActivity } from "@/actions/CreateActivity";
import { UpdateActivity } from "@/actions/UpdateActivity";
import { Activity } from "@/types/Activity";
import { ActivityType } from "@/types/ActivityType";
import { ActivityError, ActivityFields } from "@/types/FormState";
import FieldError from "./FieldError";
import FormMessage from "./FormMessage";

type ActivityFormProps = {
  types: ActivityType[];
  activity?: Activity; // absente = création, présente = modification
};

// Formulaire unique pour créer ET modifier une activité
export default function ActivityForm({ types, activity }: ActivityFormProps) {
  const initialState: ActivityError = { message: null, errors: {} };
  // En modification, l'id de l'activité est lié à l'action
  const action = activity?.id ? UpdateActivity.bind(null, activity.id) : CreateActivity;
  const [state, formAction, isPending] = useActionState<ActivityError, FormData>(
    action,
    initialState
  );

  // Attributs d'accessibilité d'un champ selon ses erreurs
  const a11y = (field: ActivityFields) => ({
    "aria-invalid": !!state.errors?.[field],
    "aria-describedby": state.errors?.[field] ? `${field}-erreur` : undefined,
  });

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      {/* Erreur générale (ex. type inexistant) */}
      <FormMessage message={state.message} />

      <div className="field">
        <label htmlFor="nom" className="label">Nom de l&apos;activité</label>
        <input
          type="text" name="nom" id="nom" className="input"
          defaultValue={activity?.nom} placeholder="Parcours des Cimes"
          {...a11y("nom")}
        />
        <FieldError id="nom-erreur" errors={state.errors?.nom} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="type_id" className="label">Type</label>
          <select
            name="type_id" id="type_id" className="input"
            defaultValue={activity?.type_id ?? ""} {...a11y("type_id")}
          >
            <option value="" disabled>Choisir un type…</option>
            {types.map((type) => (
              <option key={type.id} value={type.id}>{type.nom}</option>
            ))}
          </select>
          <FieldError id="type_id-erreur" errors={state.errors?.type_id} />
        </div>

        <div className="field">
          <label htmlFor="datetime_debut" className="label">Début</label>
          <input
            type="datetime-local" name="datetime_debut" id="datetime_debut" className="input"
            defaultValue={activity?.datetime_debut.slice(0, 16)}
            {...a11y("datetime_debut")}
          />
          <FieldError id="datetime_debut-erreur" errors={state.errors?.datetime_debut} />
        </div>

        <div className="field">
          <label htmlFor="duree" className="label">Durée (en minutes)</label>
          <input
            type="number" name="duree" id="duree" className="input" inputMode="numeric"
            min={15} max={720} step={15} defaultValue={activity?.duree ?? 60}
            {...a11y("duree")}
          />
          <FieldError id="duree-erreur" errors={state.errors?.duree} />
        </div>

        <div className="field">
          <label htmlFor="places_disponibles" className="label">Nombre de places</label>
          <input
            type="number" name="places_disponibles" id="places_disponibles" className="input"
            inputMode="numeric" min={1} max={500} defaultValue={activity?.places_disponibles ?? 10}
            {...a11y("places_disponibles")}
          />
          {activity && (activity.places_reservees ?? 0) > 0 && (
            <p className="hint">{activity.places_reservees} place(s) déjà réservée(s).</p>
          )}
          <FieldError id="places_disponibles-erreur" errors={state.errors?.places_disponibles} />
        </div>
      </div>

      <div className="field">
        <label htmlFor="description" className="label">Description</label>
        <textarea
          name="description" id="description" className="input" rows={5}
          defaultValue={activity?.description}
          placeholder="Ce que les participants vont vivre, le niveau requis, l'équipement fourni…"
          {...a11y("description")}
        />
        <FieldError id="description-erreur" errors={state.errors?.description} />
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-sand-200 pt-6 sm:flex-row sm:justify-end">
        <Link href="/admin" className="btn btn-secondary">Annuler</Link>
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending
            ? "Enregistrement…"
            : activity
              ? "Enregistrer les modifications"
              : "Créer l'activité"}
        </button>
      </div>
    </form>
  );
}

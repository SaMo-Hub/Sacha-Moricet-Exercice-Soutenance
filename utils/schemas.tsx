// Règles de validation zod partagées par plusieurs actions.
// Elles ne peuvent pas vivre dans les fichiers d'actions : un fichier "use server"
// ne peut exporter que des fonctions asynchrones.

import { z } from "zod";

// Formulaire d'activité (création et modification)
export const ActivitySchema = z.object({
  nom: z
    .string({ error: "Le nom est obligatoire" })
    .trim()
    .min(1, { error: "Le nom est obligatoire" })
    .max(255, { error: "255 caractères maximum" }),
  type_id: z.coerce
    .number({ error: "Choisissez un type d'activité" })
    .int({ error: "Choisissez un type d'activité" })
    .positive({ error: "Choisissez un type d'activité" }),
  places_disponibles: z.coerce
    .number({ error: "Indiquez un nombre de places" })
    .int({ error: "Le nombre de places doit être entier" })
    .min(1, { error: "Au moins 1 place" })
    .max(500, { error: "500 places maximum" }),
  description: z
    .string({ error: "La description est obligatoire" })
    .trim()
    .min(10, { error: "10 caractères minimum" })
    .max(2000, { error: "2000 caractères maximum" }),
  datetime_debut: z
    .string({ error: "La date est obligatoire" })
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, { error: "Date et heure invalides" }),
  duree: z.coerce
    .number({ error: "Indiquez une durée" })
    .int({ error: "La durée doit être un nombre entier de minutes" })
    .min(15, { error: "15 minutes minimum" })
    .max(720, { error: "12 heures maximum" }),
});

// Formulaire de profil : un mot de passe vide signifie "ne pas le changer"
export const ProfileSchema = z.object({
  prenom: z
    .string()
    .trim()
    .min(1, { error: "Le prénom est obligatoire" })
    .max(255, { error: "255 caractères maximum" }),
  nom: z
    .string()
    .trim()
    .min(1, { error: "Le nom est obligatoire" })
    .max(255, { error: "255 caractères maximum" }),
  email: z
    .email({ error: "Adresse e-mail invalide" })
    .max(255, { error: "255 caractères maximum" }),
  motdepasse: z.union([
    z.literal(""),
    z.string().min(8, { error: "8 caractères minimum" }).max(72, { error: "72 caractères maximum" }),
  ]),
});

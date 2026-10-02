// État renvoyé par les actions serveur aux formulaires (useActionState),
// sur le modèle du type SkillError du cours.
// T liste les noms des champs du formulaire : chaque champ peut recevoir des erreurs.
export type FormState<T extends string = string> = {
  errors?: Partial<Record<T, string[]>>;
  message?: string | null;
  success?: boolean;
};

// Champs du formulaire d'activité
export type ActivityFields =
  | "nom"
  | "type_id"
  | "places_disponibles"
  | "description"
  | "datetime_debut"
  | "duree";

// Champs du formulaire de profil
export type ProfileFields = "prenom" | "nom" | "email" | "motdepasse";

export type ActivityError = FormState<ActivityFields>;
export type ProfileError = FormState<ProfileFields>;
export type ReservationError = FormState;

// Rôles possibles d'un utilisateur (colonne users.role)
export type Role = "user" | "admin";

// Utilisateur tel que stocké en base (table users)
export type User = {
  id?: number;
  prenom: string;
  nom: string;
  email: string;
  motdepasse?: string; // jamais renvoyé au client
  role: Role;
};

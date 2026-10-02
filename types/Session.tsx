import { Role } from "./User";

// Données stockées dans le JWT du cookie "session"
export type SessionPayload = {
  id: number;
  email: string;
  prenom: string;
  role: Role;
  exp?: number; // date d'expiration du JWT, en secondes (ajoutée par jose)
};

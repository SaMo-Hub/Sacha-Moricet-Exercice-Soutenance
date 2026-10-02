// Réservation (table reservations), avec les infos de l'activité réservée
export type Reservation = {
  id?: number;
  user_id: number;
  activite_id: number;
  date_reservation: string;
  etat: number; // 1 = active (true), 0 = annulée (false) : SQLite stocke les booléens en entier
  // Champs issus de la jointure avec activites / type_activite :
  activite_nom?: string;
  datetime_debut?: string;
  duree?: number;
  type_nom?: string;
};

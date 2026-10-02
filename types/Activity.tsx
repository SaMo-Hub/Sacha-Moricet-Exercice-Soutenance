// Activité (table activites), enrichie des champs calculés par les requêtes
export type Activity = {
  id?: number;
  nom: string;
  type_id: number;
  places_disponibles: number; // capacité totale du créneau
  description: string;
  datetime_debut: string; // format "YYYY-MM-DDTHH:MM"
  duree: number; // en minutes
  // Champs issus des jointures :
  type_nom?: string; // nom du type d'activité
  places_reservees?: number; // nombre de réservations actives
};

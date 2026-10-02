-- =========================================================
-- Schéma de la base de données "Les Cimes"
-- Exécuté par scripts/init-db.mjs (ou à la main via SQLTools)
-- =========================================================

-- Utilisateurs : role vaut "user" (par défaut) ou "admin"
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prenom VARCHAR(255) NOT NULL,
  nom VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  motdepasse VARCHAR(255) NOT NULL,
  role VARCHAR(10) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'))
);

-- Types d'activité (accrobranche, nautique, ...)
CREATE TABLE IF NOT EXISTS type_activite (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom VARCHAR(255) NOT NULL UNIQUE
);

-- Activités : places_disponibles = capacité totale du créneau,
-- datetime_debut au format "YYYY-MM-DDTHH:MM" (celui de <input type="datetime-local">),
-- duree en minutes
CREATE TABLE IF NOT EXISTS activites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom VARCHAR(255) NOT NULL,
  type_id INTEGER NOT NULL,
  places_disponibles INTEGER NOT NULL CHECK (places_disponibles > 0),
  description TEXT NOT NULL,
  datetime_debut DATETIME NOT NULL,
  duree INTEGER NOT NULL CHECK (duree > 0),
  FOREIGN KEY (type_id) REFERENCES type_activite(id)
);

-- Réservations : etat vaut 1 (true, active) par défaut, 0 (false) si annulée
CREATE TABLE IF NOT EXISTS reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  activite_id INTEGER NOT NULL,
  date_reservation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  etat BOOLEAN NOT NULL DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (activite_id) REFERENCES activites(id) ON DELETE CASCADE
);

-- Index pour les requêtes fréquentes (places restantes, "mes réservations")
CREATE INDEX IF NOT EXISTS idx_reservations_activite ON reservations (activite_id, etat);
CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations (user_id);

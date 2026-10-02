// =========================================================
// Initialisation de la base SQLite "Les Cimes"
//
//   npm run db:init   -> crée les tables et insère le jeu de démo si la base est vide
//   npm run db:reset  -> supprime les tables puis recrée la base avec le jeu de démo
//
// Équivalent automatisé de l'étape "SQLTools" du cours : le correcteur peut lancer
// le projet sans rien configurer à la main.
// =========================================================

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import bcrypt from "bcryptjs";

// Si .env.local n'existe pas encore, on le crée avec un secret JWT aléatoire
if (!existsSync(".env.local")) {
  const secret = randomBytes(32).toString("hex");
  writeFileSync(".env.local", `DATABASE_NAME=database.db\nJWT_SECRET=${secret}\n`);
  console.log("✓ .env.local créé (secret JWT généré)");
}

// Chargement des variables d'environnement (Node >= 20.12)
process.loadEnvFile(".env.local");
const filename = process.env.DATABASE_NAME || "database.db";

const db = await open({ filename, driver: sqlite3.Database });
await db.exec("PRAGMA foreign_keys = ON");

// --reset : on vide la base en supprimant les tables (et non le fichier,
// pour que le serveur Next.js déjà lancé garde une connexion valide)
if (process.argv.includes("--reset")) {
  await db.exec(`
    DROP TABLE IF EXISTS reservations;
    DROP TABLE IF EXISTS activites;
    DROP TABLE IF EXISTS type_activite;
    DROP TABLE IF EXISTS users;
  `);
  console.log(`✓ tables de ${filename} supprimées`);
}

// Création des tables (idempotent grâce aux "IF NOT EXISTS")
await db.exec(readFileSync("database/schema.sql", "utf-8"));

// On n'insère le jeu de démo que si la base est vide
const { total } = await db.get("SELECT COUNT(*) AS total FROM users");
if (total > 0) {
  console.log(`✓ ${filename} déjà initialisée, rien à faire`);
  await db.close();
  process.exit(0);
}

/**
 * Renvoie une date au format "YYYY-MM-DDTHH:MM" décalée de `days` jours par rapport
 * à aujourd'hui, à l'heure `time` : les activités de démo sont donc toujours à venir.
 */
function inDays(days, time) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${time}`;
}

// ---------- Utilisateurs ----------
const users = [
  ["Camille", "Rousseau", "admin@lescimes.fr", "Admin123!", "admin"],
  ["Léa", "Dupont", "lea@lescimes.fr", "Lea12345!", "user"],
  ["Tom", "Martin", "tom@lescimes.fr", "Tom12345!", "user"],
];
for (const [prenom, nom, email, password, role] of users) {
  const hash = await bcrypt.hash(password, 10);
  await db.run(
    "INSERT INTO users (prenom, nom, email, motdepasse, role) VALUES (?, ?, ?, ?, ?)",
    prenom, nom, email, hash, role
  );
}

// ---------- Types d'activité ----------
const types = ["Accrobranche", "Escalade", "Nautique", "Tir à l'arc", "Bien-être", "Famille"];
for (const nom of types) {
  await db.run("INSERT INTO type_activite (nom) VALUES (?)", nom);
}

// ---------- Activités ----------
// [nom, type_id, places_disponibles, description, datetime_debut, duree (min)]
const activites = [
  ["Parcours des Cimes", 1, 16, "Notre parcours signature : 42 ateliers entre 8 et 22 mètres de haut, ponts de singe, filets suspendus et une tyrolienne finale de 180 mètres au-dessus de l'étang. Ligne de vie continue, briefing sécurité inclus.", inDays(1, "10:00"), 150],
  ["Tyrolienne géante", 1, 12, "Deux tyroliennes parallèles de 450 mètres pour faire la course à 60 km/h au-dessus de la vallée. Accessible dès 1,40 m.", inDays(1, "14:30"), 60],
  ["Initiation escalade en falaise", 2, 8, "Une demi-journée encadrée par un moniteur diplômé sur la falaise école : nœuds, assurage, premières voies du 3 au 5a. Tout le matériel est fourni.", inDays(2, "09:00"), 180],
  ["Bloc au coucher du soleil", 2, 10, "Session de bloc sur les rochers du site, avec crash-pads et parade encadrée, à l'heure où la lumière est la plus belle.", inDays(3, "18:00"), 120],
  ["Descente en canyon", 3, 2, "Sauts, toboggans naturels et rappels dans le canyon du Ravin. Combinaison néoprène fournie. Savoir nager est obligatoire.", inDays(4, "09:30"), 240],
  ["Balade en kayak sur l'étang", 3, 14, "Une boucle tranquille de 6 km en kayak biplace, idéale pour découvrir la faune de l'étang. Gilets fournis.", inDays(4, "15:00"), 90],
  ["Tir à l'arc instinctif", 4, 12, "Parcours de 20 cibles 3D en forêt, après une initiation à la posture et à la visée instinctive.", inDays(5, "10:30"), 120],
  ["Yoga dans les arbres", 5, 10, "Une séance de yoga douce sur la grande plateforme en bois, à 6 mètres du sol, au milieu des chênes.", inDays(6, "08:30"), 75],
  ["Mini-cimes (4-8 ans)", 6, 15, "Un parcours à hauteur d'enfant (1 à 3 m) avec filets, cabanes et petite tyrolienne. Un adulte accompagnateur au sol est requis.", inDays(7, "11:00"), 60],
  ["Chasse au trésor en forêt", 6, 20, "Énigmes, carte au trésor et épreuves en équipe sur 2 km de sentiers. Parfait pour les familles et les anniversaires.", inDays(9, "14:00"), 120],
  ["Nocturne des Cimes", 1, 16, "Le parcours des Cimes à la frontale, une fois la nuit tombée. Sensations garanties, lampe fournie.", inDays(12, "20:30"), 120],
  ["Paddle au lever du jour", 3, 8, "Stand-up paddle sur l'étang encore embrumé. Initiation incluse, aucun niveau requis.", inDays(-3, "07:00"), 90],
];
for (const activite of activites) {
  await db.run(
    "INSERT INTO activites (nom, type_id, places_disponibles, description, datetime_debut, duree) VALUES (?, ?, ?, ?, ?, ?)",
    ...activite
  );
}

// ---------- Réservations ----------
// [user_id, activite_id, etat]
const reservations = [
  [1, 5, 1], // la descente en canyon (2 places) est complète :
  [3, 5, 1], // Camille et Tom ont pris les deux places
  [2, 1, 1], // Léa : Parcours des Cimes
  [2, 8, 1], // Léa : Yoga dans les arbres
  [2, 6, 0], // Léa : kayak annulé
  [2, 12, 1], // Léa : paddle (activité passée)
  [3, 1, 1], // Tom : Parcours des Cimes
];
for (const [user_id, activite_id, etat] of reservations) {
  await db.run(
    "INSERT INTO reservations (user_id, activite_id, etat) VALUES (?, ?, ?)",
    user_id, activite_id, etat
  );
}

await db.close();
console.log(`✓ ${filename} initialisée : ${users.length} utilisateurs, ${activites.length} activités, ${reservations.length} réservations`);

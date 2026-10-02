// Connexion à la base SQLite.
// ⚠️ Pas de "use server" ici : ce fichier n'est importé que par du code serveur,
// et on ne veut surtout pas exposer openDb() comme une action appelable du navigateur.

import { Database, open } from "sqlite";
import sqlite3 from "sqlite3";

// Instance partagée : la connexion est ouverte une seule fois puis réutilisée
let db: Database | null = null;

export async function openDb() {
  // Check if the database instance has been initialized
  if (!db) {
    // If the database instance is not initialized, open the database connection
    db = await open({
      filename: process.env.DATABASE_NAME || "", // Specify the database file path
      driver: sqlite3.Database, // Specify the database driver (sqlite3 in this case)
    });
    // SQLite n'applique les clés étrangères (ON DELETE CASCADE) que si on le demande
    await db.exec("PRAGMA foreign_keys = ON");
  }

  return db;
}

"use server";

import { checkAdmin } from "@/utils/sessions";
import { openDb } from "@/utils/database";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// DELETE /api/activities/delete/[id] : suppression d'une activité (administrateurs)
export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  // Seul un administrateur peut supprimer une activité
  const isAdmin = await checkAdmin();
  if (isAdmin.status >= 300) return isAdmin;

  // Get the id from params
  const id = Number((await params).id);

  // Call deleteActivity function (see below)
  const response = await deleteActivity(id);

  if (response.changes === 0) {
    return NextResponse.json(
      { message: "Activité introuvable" },
      { status: 404 }
    );
  }

  // Les listes publiques ne doivent plus afficher l'activité
  revalidatePath("/", "layout");

  return NextResponse.json({ response });
}

async function deleteActivity(activite_id: number) {
  const db = await openDb();

  // Les réservations liées sont supprimées automatiquement (ON DELETE CASCADE)
  const sql = "DELETE FROM activites WHERE id = ?";
  const deleteActivity = await db.run(sql, activite_id);

  return deleteActivity;
}

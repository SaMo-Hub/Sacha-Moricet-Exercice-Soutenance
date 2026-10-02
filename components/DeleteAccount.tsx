"use client";

import { useState, useTransition } from "react";
import { DeleteProfile } from "@/actions/DeleteProfile";
import ConfirmButton from "./ConfirmButton";
import FormMessage from "./FormMessage";
import { TrashIcon } from "./Icons";

// Zone de suppression du compte, avec confirmation obligatoire
export default function DeleteAccount() {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      // En cas de succès, l'action redirige vers l'accueil :
      // on ne reçoit une réponse que s'il y a eu une erreur
      const result = await DeleteProfile();
      if (result?.message) setError(result.message);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <FormMessage message={error} />
      <div>
        <ConfirmButton
          className="btn btn-danger-outline w-full sm:w-auto"
          disabled={isPending}
          title="Supprimer votre compte ?"
          description={
            <p>
              Cette action est <strong>définitive</strong> : votre profil et toutes vos
              réservations seront supprimés, et les places réservées seront libérées.
            </p>
          }
          confirmLabel="Supprimer définitivement"
          cancelLabel="Conserver mon compte"
          onConfirm={handleDelete}
        >
          <TrashIcon size={16} />
          {isPending ? "Suppression…" : "Supprimer mon compte"}
        </ConfirmButton>
      </div>
    </div>
  );
}

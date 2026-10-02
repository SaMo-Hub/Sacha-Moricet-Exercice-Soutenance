"use client";

import { ReactNode, useId, useRef } from "react";

type ConfirmButtonProps = {
  children: ReactNode; // contenu du bouton déclencheur
  className?: string; // classes du bouton déclencheur
  title: string; // titre de la boîte de dialogue
  description: ReactNode; // conséquences de l'action
  confirmLabel: string; // libellé du bouton de confirmation
  cancelLabel?: string; // libellé du bouton qui referme sans rien faire
  onConfirm: () => void; // action exécutée après confirmation
  disabled?: boolean;
  ariaLabel?: string;
};

// Bouton qui demande une confirmation avant une action destructive.
// Utilise l'élément natif <dialog> : focus piégé, touche Échap et
// arrière-plan inerte sont gérés par le navigateur.
export default function ConfirmButton({
  children,
  className,
  title,
  description,
  confirmLabel,
  cancelLabel = "Annuler",
  onConfirm,
  disabled,
  ariaLabel,
}: ConfirmButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId(); // identifiant unique pour relier le titre à la boîte

  const handleConfirm = () => {
    dialogRef.current?.close();
    onConfirm();
  };

  return (
    <>
      <button
        type="button"
        className={className}
        disabled={disabled}
        aria-label={ariaLabel}
        onClick={() => dialogRef.current?.showModal()}
      >
        {children}
      </button>

      <dialog
        ref={dialogRef}
        className="dialog"
        aria-labelledby={titleId}
        // Un clic sur l'arrière-plan (en dehors du contenu) ferme la boîte
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <div className="p-6">
          <h2 id={titleId} className="text-xl font-semibold">
            {title}
          </h2>
          <div className="mt-2 text-ink-500">{description}</div>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {/* Le bouton "Annuler" est en premier dans le DOM : il reçoit le focus */}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => dialogRef.current?.close()}
              autoFocus
            >
              {cancelLabel}
            </button>
            <button type="button" className="btn btn-danger" onClick={handleConfirm}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

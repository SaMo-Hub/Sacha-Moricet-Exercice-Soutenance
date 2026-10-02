import { AlertIcon } from "./Icons";

// Affiche les erreurs de validation d'un champ (renvoyées par zod).
// L'id permet de relier le message au champ avec aria-describedby.
export default function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors || errors.length === 0) return null;

  return (
    <div id={id} aria-live="polite">
      {errors.map((error) => (
        <p key={error} className="flex items-center gap-1.5 text-sm font-medium text-danger-600">
          <AlertIcon size={15} className="shrink-0" />
          {error}
        </p>
      ))}
    </div>
  );
}

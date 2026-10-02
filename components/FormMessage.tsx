import clsx from "clsx";
import { AlertIcon, CheckIcon } from "./Icons";

type FormMessageProps = {
  message?: string | null;
  type?: "error" | "success";
};

// Message global d'un formulaire (succès ou erreur), annoncé aux lecteurs d'écran
export default function FormMessage({ message, type = "error" }: FormMessageProps) {
  if (!message) return null;

  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={clsx(
        "fade-in flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium",
        {
          "border-danger-200 bg-danger-50 text-danger-700": type === "error",
          "border-forest-200 bg-forest-50 text-forest-700": type === "success",
        }
      )}
    >
      {type === "error" ? (
        <AlertIcon size={18} className="mt-px shrink-0" />
      ) : (
        <CheckIcon size={18} className="mt-px shrink-0" />
      )}
      <p>{message}</p>
    </div>
  );
}

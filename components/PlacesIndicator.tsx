import clsx from "clsx";

type PlacesIndicatorProps = {
  total: number; // places_disponibles
  reserved: number; // places_reservees
  size?: "sm" | "lg";
};

// Jauge des places restantes : la couleur ET le texte indiquent l'état
// (jamais la couleur seule)
export default function PlacesIndicator({ total, reserved, size = "sm" }: PlacesIndicatorProps) {
  const remaining = Math.max(total - reserved, 0);
  const ratio = total > 0 ? Math.min(reserved / total, 1) : 1;
  const isFull = remaining === 0;
  const isLow = !isFull && remaining <= Math.max(2, Math.ceil(total * 0.2));

  // Libellé lisible : "Complet", "Plus que 2 places", "12 places libres"
  const label = isFull
    ? "Complet"
    : isLow
      ? `Plus que ${remaining} place${remaining > 1 ? "s" : ""}`
      : `${remaining} places libres`;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span
          className={clsx("font-semibold", {
            "text-sm": size === "sm",
            "text-base": size === "lg",
            "text-danger-600": isFull,
            "text-sun-700": isLow,
            "text-forest-700": !isFull && !isLow,
          })}
        >
          {label}
        </span>
        <span className="text-xs tabular-nums text-ink-500">
          {reserved}/{total} réservées
        </span>
      </div>
      <div
        className={clsx("overflow-hidden rounded-full bg-sand-100", {
          "h-1.5": size === "sm",
          "h-2.5": size === "lg",
        })}
        role="meter"
        aria-label="Places réservées"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={reserved}
      >
        <div
          className={clsx("h-full rounded-full", {
            "bg-danger-600": isFull,
            "bg-sun-500": isLow,
            "bg-forest-500": !isFull && !isLow,
          })}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}

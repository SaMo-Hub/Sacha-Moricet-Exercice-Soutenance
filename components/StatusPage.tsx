import { ReactNode } from "react";

type StatusPageProps = {
  code: string; // "404", "403", ...
  title: string;
  description: string;
  children: ReactNode; // actions proposées
};

// Gabarit des pages d'état (404, accès refusé, erreur)
export default function StatusPage({ code, title, description, children }: StatusPageProps) {
  return (
    <div className="container-page flex flex-col items-center py-16 text-center sm:py-24">
      {/* Illustration : sommet avec le code d'erreur */}
      <div className="relative mb-8" aria-hidden="true">
        <svg width="220" height="120" viewBox="0 0 220 120">
          <path d="M10 115 80 30l30 38 25-28 75 75Z" fill="var(--color-forest-100)" />
          <path d="M80 30 66 47l14-5 12 8Z" fill="white" />
          <circle cx="170" cy="28" r="12" fill="var(--color-sun-500)" />
        </svg>
        <span className="absolute inset-x-0 bottom-1 font-display text-5xl font-bold text-forest-700">
          {code}
        </span>
      </div>
      <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-md text-lg text-ink-500">{description}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">{children}</div>
    </div>
  );
}

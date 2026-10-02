"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { SearchIcon, XIcon } from "./Icons";

// Barre de recherche par nom : met à jour le paramètre ?q= de l'URL.
// La page serveur relit ce paramètre et refait la requête : le lien reste partageable.
// ⚠️ useSearchParams doit être encadré par <Suspense> (voir app/activites/page.tsx)
export default function SearchBar({ placeholder = "Rechercher une activité…" }: { placeholder?: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const urlQuery = searchParams.get("q") ?? "";
  const [value, setValue] = useState(urlQuery);
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
  // Recherche "en direct" seulement sur la page des activités, où les résultats
  // sont juste en dessous. Ailleurs (accueil), naviguer pendant la frappe ferait
  // perdre le focus et la fin de la saisie : on attend la touche Entrée.
  const isLive = pathname === "/activites";

  // Si l'URL change sans passer par ce champ (lien "Voir toutes les activités",
  // bouton précédent du navigateur...), on resynchronise la saisie
  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery);
    if (urlQuery !== value.trim()) setValue(urlQuery);
  }

  // On attend 300 ms après la dernière frappe avant de lancer la recherche
  useEffect(() => {
    if (!isLive || value.trim() === urlQuery) return;

    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set("q", value.trim());
      } else {
        params.delete("q");
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }, 300);

    // Nettoyage : on annule la recherche précédente si l'utilisateur tape encore
    return () => clearTimeout(timeout);
  }, [value, urlQuery, searchParams, pathname, router, isLive]);

  // Entrée depuis l'accueil : on ouvre la page des activités avec la recherche.
  // push (et non replace) : le bouton "Précédent" ramène bien à l'accueil.
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLive) return; // la recherche se lance déjà toute seule
    const q = value.trim();
    router.push(q ? `/activites?q=${encodeURIComponent(q)}` : "/activites");
  };

  return (
    <form role="search" className="relative" onSubmit={handleSubmit}>
      <label htmlFor="recherche" className="sr-only">
        Rechercher une activité par nom
      </label>
      <SearchIcon
        size={20}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-500"
      />
      <input
        id="recherche"
        type="search"
        name="q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        enterKeyHint="search"
        className="input h-14 rounded-2xl pl-12 pr-12 text-base shadow-card [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label="Effacer la recherche"
          className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-ink-500 hover:bg-sand-100 hover:text-ink-900"
        >
          <XIcon size={18} />
        </button>
      )}
    </form>
  );
}

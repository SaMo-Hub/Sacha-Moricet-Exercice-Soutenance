@AGENTS.md

# CLAUDE.md — Les Cimes, réservations de parc d'activités

Devoir ICAN (Next.js) : système de réservation pour un parc d'activités. Rendu sur GitHub
(identifiant du correcteur : `yoanncoualan`) le **02/10/2026 à 15h00**, puis oral de 20 min.

## Règle n°1 : coder comme le cours de Yoann Coualan

Le code doit suivre le tuto https://docs.yoanncoualan.com/nextjs (le correcteur en est
l'auteur). Les conventions qui en découlent :

- **SQLite** via `sqlite` + `sqlite3`, fichier `database.db` à la racine, nom dans
  `DATABASE_NAME` (`.env.local`). Connexion ouverte par `openDb()` (`utils/database.tsx`).
- **Routes d'API** dans `app/api/**/route.tsx` (`"use server";` en tête, `NextResponse.json`)
  pour ce que le client appelle avec `fetch` : inscription, connexion, mutations côté client.
- **Actions** dans `actions/<Verbe><Objet>.tsx` (`"use server";`) qui renvoient un
  `NextResponse` ; l'appelant teste `!response.ok || response.status >= 300`.
  Mutation côté serveur = action de **validation zod** (`CreateX`, `UpdateX`) appelée par
  `useActionState`, qui délègue à une action **base de données** (`addX`, `editX`).
- Types dans `types/<Nom>.tsx`, utilitaires dans `utils/`, polices dans `fonts/fonts.tsx`.
- **Sessions** : JWT `jose` dans un cookie `session` (`utils/sessions.tsx`), `checkAuth()` /
  `checkAdmin()` renvoient un `NextResponse` (statut < 300 = OK). Protection des pages par
  `proxy.ts` (Next 16 : plus de `middleware.ts`).
- Mot de passe : haché **côté client** (`hashPassword`) avant l'inscription, comme dans le
  cours ; comparé côté serveur avec `checkPassword`.
- Chargements : `Suspense` + composant `*Loader`. Erreurs : `error.tsx`, `not-found.tsx`.
- Commentaires en français, nombreux (ils sont notés).

## Sécurité : à ne pas casser

- Toute fonction exportée d'un fichier `"use server"` est appelable depuis le navigateur :
  **chaque action revérifie la session/le rôle elle-même**, le proxy n'est qu'une première
  barrière. `utils/sessions.tsx` et `utils/database.tsx` ne doivent **pas** porter
  `"use server"` (sinon `createCookie` deviendrait un endpoint public de forge de session).
- Règles métier vérifiées côté serveur : activité complète ou passée non réservable,
  double réservation refusée, annulation seulement de ses propres réservations, nombre de
  places d'une activité jamais inférieur aux réservations actives.

## Commandes

```bash
npm run db:init   # crée database.db (schéma + jeu de démo) — lancé aussi par predev
npm run db:reset  # DROP des tables puis jeu de démo (fonctionne serveur lancé)
npm run dev       # http://localhost:3000
npm run build && npm run lint
```

Comptes de démo : `admin@lescimes.fr` / `Admin123!` (admin), `lea@lescimes.fr` / `Lea12345!`.

## Pièges connus

- Le port 3000 est souvent pris par une autre appli de la machine : `next dev` bascule sur
  3001/3002… — lire le port dans la sortie avant de tester.
- Ne pas supprimer `database.db` serveur lancé : la connexion de `openDb()` (gardée en
  mémoire) pointerait sur l'ancien fichier. D'où le `DROP TABLE` de `db:reset`.
- `title` défini en chaîne dans un layout casse le template du root layout pour ses
  enfants : redéclarer `title.template` (voir `app/admin/layout.tsx`).
- zod v4 : `z.flattenError(err).fieldErrors` (et non `err.flatten()`), messages via
  `{ error: "…" }`. Un `<select>` sur l'option vide désactivée n'envoie rien → donner un
  message à `z.coerce.number({ error })`.
- Dates stockées en heure du parc sans fuseau : passer par `utils/dates.tsx`
  (`isPast`, `nowAtPark`, `formatDateTime`), jamais `new Date(datetime_debut)` directement.

## Arborescence

- `database/schema.sql` — tables `users`, `type_activite`, `activites`, `reservations`
- `scripts/init-db.mjs` — exécute le schéma et insère le jeu de démo (dates relatives au jour)
- `app/` — pages publiques (`/`, `/activites`, `/activites/[id]`, `/login`, `/register`),
  espace connecté `/mon-compte/*`, back-office `/admin/*`, API `app/api/*`
- `components/` — composants réutilisables (`ConfirmButton`, `FieldError`, `EmptyState`…).
  Erreur de chargement = `EmptyState` + `RetryButton` (`router.refresh()`), jamais un `<p>` sans issue.
- Styles : Tailwind v4, **tokens et classes de composants dans `app/globals.css`**
  (`.btn`, `.input`, `.card`…) — les réutiliser plutôt que réécrire des classes utilitaires.
  Les `:hover` du CSS maison vont dans le bloc `@media (hover: hover) and (pointer: fine)`.
  Tout squelette porte `.loader-delayed` (invisible 300 ms : pas de flash si la réponse est rapide).

## Maintenance de ce fichier

Garde ce CLAUDE.md à jour. Dès qu'une nouvelle fonctionnalité, dépendance, partie d'architecture, convention ou commande importante apparaît ou change, mets à jour la section concernée du fichier. N'ajoute que des informations utiles et durables, jamais de détails éphémères.

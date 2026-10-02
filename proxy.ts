// Le proxy (ex-middleware) contrôle l'accès aux pages avant leur rendu.
// C'est une première barrière : chaque action serveur revérifie aussi les droits.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkAdmin, checkAuth } from "./utils/sessions";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthorized = await checkAuth();
  const isLogged = isAuthorized.status < 300;

  // Pages réservées aux utilisateurs connectés : on mémorise la page demandée
  // pour y revenir après la connexion
  if (
    (pathname.startsWith("/mon-compte") || pathname.startsWith("/admin")) &&
    !isLogged
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Pages réservées aux administrateurs
  if (pathname.startsWith("/admin")) {
    const isAdmin = await checkAdmin();
    if (isAdmin.status >= 300) {
      return NextResponse.redirect(new URL("/acces-refuse", request.url));
    }
  }

  // Un utilisateur déjà connecté n'a rien à faire sur la connexion / l'inscription
  if ((pathname === "/login" || pathname === "/register") && isLogged) {
    return NextResponse.redirect(new URL("/mon-compte", request.url));
  }
}

// Le proxy ne s'exécute que sur ces routes (pas sur les fichiers statiques)
export const config = {
  matcher: ["/mon-compte/:path*", "/admin/:path*", "/login", "/register"],
};

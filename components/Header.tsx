import { getSession } from "@/utils/sessions";
import Logo from "./Logo";
import Nav from "./Nav";

// En-tête du site : composant serveur qui lit la session
// puis la transmet au menu (composant client)
export default async function Header() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-40 border-b border-sand-200 bg-sand-50/90 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />
        <Nav
          user={
            session
              ? { prenom: session.prenom, isAdmin: session.role === "admin" }
              : null
          }
        />
      </div>
    </header>
  );
}

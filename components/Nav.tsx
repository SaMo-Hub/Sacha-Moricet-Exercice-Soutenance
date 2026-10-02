"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import clsx from "clsx";
import { Logout } from "@/actions/Logout";
import { LogoutIcon, MenuIcon, XIcon } from "./Icons";

// Données de l'utilisateur connecté utiles au menu (null si déconnecté)
type NavProps = {
  user: { prenom: string; isAdmin: boolean } | null;
};

export default function Nav({ user }: NavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false); // menu mobile ouvert ?
  const [isPending, startTransition] = useTransition();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);

  // Menu mobile ouvert : Échap le referme (et rend le focus au bouton),
  // un clic en dehors du panneau aussi
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!menuRef.current?.contains(target) && !menuButtonRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    // Nettoyage : on retire les écouteurs quand le menu se ferme
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen]);

  // Vrai si le lien correspond à la page courante (ou à l'une de ses sous-pages)
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const handleLogout = () => {
    startTransition(async () => {
      await Logout(); // Destroy the cookie
      router.push("/"); // Redirect to home page
      router.refresh(); // Refresh the header
    });
  };

  // Liens affichés selon l'état de connexion et le rôle
  const links = [
    { href: "/activites", label: "Activités" },
    ...(user ? [{ href: "/mon-compte", label: "Mon compte" }] : []),
    ...(user?.isAdmin ? [{ href: "/admin", label: "Administration" }] : []),
  ];

  const navLinks = links.map((link) => (
    <Link
      key={link.href}
      href={link.href}
      aria-current={isActive(link.href) ? "page" : undefined}
      onClick={() => setIsOpen(false)} // referme le menu mobile
      className={clsx("nav-link", { active: isActive(link.href) })}
    >
      {link.label}
    </Link>
  ));

  // Boutons de compte : déconnexion, ou connexion / inscription
  const accountActions = user ? (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className="btn btn-ghost"
    >
      <LogoutIcon />
      {isPending ? "Déconnexion…" : "Se déconnecter"}
    </button>
  ) : (
    <>
      <Link href="/login" className="btn btn-ghost" onClick={() => setIsOpen(false)}>
        Se connecter
      </Link>
      <Link href="/register" className="btn btn-primary" onClick={() => setIsOpen(false)}>
        Créer un compte
      </Link>
    </>
  );

  return (
    <>
      {/* Menu ordinateur */}
      <nav aria-label="Menu principal" className="hidden items-center gap-1 md:flex">
        {navLinks}
        <span className="mx-2 h-6 w-px bg-sand-200" aria-hidden="true" />
        {user && (
          // Masqué entre 768 et 1024 px : sinon le menu admin déborde de l'en-tête
          <span className="mr-1 hidden text-sm text-ink-500 lg:inline">
            Bonjour, <strong className="text-ink-900">{user.prenom}</strong>
          </span>
        )}
        {accountActions}
      </nav>

      {/* Bouton du menu mobile */}
      <button
        ref={menuButtonRef}
        type="button"
        className="btn btn-ghost -mr-2 px-3 md:hidden"
        aria-expanded={isOpen}
        aria-controls="menu-mobile"
        aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <XIcon size={22} /> : <MenuIcon size={22} />}
      </button>

      {/* Menu mobile : panneau qui se déplie sous l'en-tête */}
      {isOpen && (
        <nav
          ref={menuRef}
          id="menu-mobile"
          aria-label="Menu principal"
          className="fade-in absolute inset-x-0 top-16 border-b border-sand-200 bg-sand-50 shadow-lift md:hidden"
        >
          <div className="container-page flex flex-col gap-1 py-4">
            {user && (
              <p className="px-3.5 pb-2 text-sm text-ink-500">
                Connecté en tant que <strong className="text-ink-900">{user.prenom}</strong>
              </p>
            )}
            {navLinks}
            <div className="mt-3 flex flex-col gap-2 border-t border-sand-200 pt-4 [&>*]:w-full">
              {accountActions}
            </div>
          </div>
        </nav>
      )}
    </>
  );
}

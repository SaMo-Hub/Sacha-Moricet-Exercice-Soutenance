"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { TicketIcon, UsersIcon } from "./Icons";

// Onglets de l'espace "Mon compte" : le lien de la page courante est mis en avant
export default function AccountNav() {
  const pathname = usePathname();

  const tabs = [
    { href: "/mon-compte/reservations", label: "Mes réservations", icon: <TicketIcon size={17} /> },
    { href: "/mon-compte/profil", label: "Mon profil", icon: <UsersIcon size={17} /> },
  ];

  return (
    <nav aria-label="Mon compte" className="flex gap-1 border-b border-sand-200 pb-px">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-current={pathname === tab.href ? "page" : undefined}
          className={clsx(
            "nav-link -mb-px rounded-b-none border-b-2 border-transparent",
            { "active border-forest-600!": pathname === tab.href }
          )}
        >
          {tab.icon}
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

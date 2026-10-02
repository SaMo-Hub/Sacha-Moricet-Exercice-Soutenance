import { ReactNode } from "react";
import Logo from "./Logo";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode; // lien vers l'autre formulaire (connexion <-> inscription)
};

// Mise en page commune aux pages de connexion et d'inscription
export default function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="container-page flex justify-center py-10 sm:py-16">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <div className="card p-6 sm:p-8">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-ink-500">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
        <p className="mt-6 text-center text-sm text-ink-500">{footer}</p>
      </div>
    </div>
  );
}

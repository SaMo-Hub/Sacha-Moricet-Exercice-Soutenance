import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";
import AuthCard from "@/components/AuthCard";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous pour réserver vos activités au parc Les Cimes.",
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Bon retour parmi nous"
      subtitle="Connectez-vous pour réserver et gérer vos activités."
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link href="/register" className="font-semibold text-forest-700 underline underline-offset-2">
            Créer un compte
          </Link>
        </>
      }
    >
      {/* LoginForm utilise useSearchParams : il doit être encadré par Suspense */}
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}

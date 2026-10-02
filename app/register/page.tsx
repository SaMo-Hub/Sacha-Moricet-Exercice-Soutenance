import type { Metadata } from "next";
import Link from "next/link";
import RegisterForm from "@/components/RegisterForm";
import AuthCard from "@/components/AuthCard";

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Créez votre compte Les Cimes pour réserver vos activités en quelques secondes.",
};

export default function RegisterPage() {
  return (
    <AuthCard
      title="Créer un compte"
      subtitle="Quelques secondes suffisent pour réserver votre première activité."
      footer={
        <>
          Déjà inscrit ?{" "}
          <Link href="/login" className="font-semibold text-forest-700 underline underline-offset-2">
            Se connecter
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}

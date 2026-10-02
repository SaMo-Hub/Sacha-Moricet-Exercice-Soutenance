// Pied de page commun à toutes les pages
export default function Footer() {
  return (
    <footer className="mt-auto border-t border-sand-200 bg-sand-100/60">
      <div className="container-page flex flex-col gap-2 py-8 text-sm text-ink-500 sm:flex-row sm:items-center sm:justify-between">
        <p>
          <strong className="font-display text-forest-900">Les Cimes</strong> · Parc
          d&apos;aventure en forêt
        </p>
        <p>Ouvert tous les jours de 9h à 21h · Projet Next.js ICAN</p>
      </div>
    </footer>
  );
}

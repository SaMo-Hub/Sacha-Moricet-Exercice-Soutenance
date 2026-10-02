import Link from "next/link";

// Logo du parc : deux sommets stylisés + nom
export default function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 rounded-lg font-display text-lg font-bold text-forest-900"
    >
      <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
        <rect width="34" height="34" rx="10" fill="var(--color-forest-600)" />
        <path d="M5 25 13 12l4 6 3-4 9 11Z" fill="var(--color-forest-100)" />
        <path d="M13 12 10.4 16.2 13 15l2.3 1.4Z" fill="white" />
        <circle cx="24" cy="10" r="2.6" fill="var(--color-sun-500)" />
      </svg>
      Les Cimes
    </Link>
  );
}

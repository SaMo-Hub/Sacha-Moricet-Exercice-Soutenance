// Squelette affiché pendant le chargement des activités :
// il reprend la forme des cartes pour éviter un saut de mise en page
export default function ActivitiesLoader({ count = 6 }: { count?: number }) {
  return (
    // loader-delayed : invisible pendant 300 ms, pour ne pas clignoter si la réponse est rapide
    <div className="loader-delayed grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
      <span className="sr-only">Chargement des activités…</span>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card flex flex-col gap-4 p-5" aria-hidden="true">
          <div className="flex gap-4">
            <div className="skeleton h-[4.5rem] w-14 rounded-xl" />
            <div className="flex flex-1 flex-col gap-2 pt-1">
              <div className="skeleton h-5 w-24 rounded-full" />
              <div className="skeleton h-5 w-4/5" />
              <div className="skeleton h-4 w-1/2" />
            </div>
          </div>
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-1.5 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

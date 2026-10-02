// Fonctions d'affichage des dates et durées en français.
//
// Les dates sont stockées en "heure du parc" (format "YYYY-MM-DDTHH:MM", sans fuseau).
// Pour qu'elles s'affichent pareil sur le serveur et dans le navigateur, quel que soit
// leur fuseau horaire, on les lit comme de l'UTC et on les formate en UTC.

const PARK_TIMEZONE = "Europe/Paris";

// Transforme "2026-10-04T10:00" en Date (lue comme UTC, voir ci-dessus)
function parse(datetime: string) {
  const [day, time = "00:00"] = datetime.replace(" ", "T").split("T");
  const [y, m, d] = day.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  return new Date(Date.UTC(y, m - 1, d, h, mi));
}

// "samedi 4 octobre à 10h00"
export function formatDateTime(datetime: string) {
  const day = parse(datetime).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
  return `${day} à ${formatTime(datetime)}`;
}

// "4 oct." : version courte pour les cartes
export function formatShortDate(datetime: string) {
  return parse(datetime).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

// "10h00"
export function formatTime(datetime: string) {
  return parse(datetime)
    .toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })
    .replace(":", "h");
}

// 150 -> "2h30", 60 -> "1h", 45 -> "45 min"
export function formatDuree(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}

// Date et heure actuelles au parc, au format "YYYY-MM-DDTHH:MM"
export function nowAtPark() {
  // Le format suédois (sv-SE) donne directement "2026-10-04 10:00"
  return new Date()
    .toLocaleString("sv-SE", {
      timeZone: PARK_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(" ", "T");
}

// Vrai si l'activité a déjà commencé (comparaison de chaînes au même format)
export function isPast(datetime: string) {
  return datetime.replace(" ", "T") < nowAtPark();
}

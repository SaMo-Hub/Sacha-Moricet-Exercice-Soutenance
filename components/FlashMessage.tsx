import FormMessage from "./FormMessage";

// Messages affichés après une redirection (paramètre ?message= de l'URL).
// On passe un code et non le texte : personne ne peut injecter un message arbitraire.
const MESSAGES: Record<string, string> = {
  created: "L'activité a été créée.",
  updated: "L'activité a été modifiée.",
  "account-deleted": "Votre compte a bien été supprimé. À bientôt dans les arbres !",
  registered: "Votre compte est créé, vous pouvez vous connecter.",
};

export default function FlashMessage({ code }: { code?: string }) {
  if (!code || !MESSAGES[code]) return null;
  return <FormMessage type="success" message={MESSAGES[code]} />;
}

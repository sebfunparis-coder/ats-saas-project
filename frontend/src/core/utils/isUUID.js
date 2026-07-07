/**
 * Détecte un vrai UUID Supabase par opposition à un ID mock (entier, ex. "1",
 * "2") utilisé par les données de démonstration (INITIAL_APPLICATIONS,
 * INITIAL_CANDIDATES...) quand Supabase n'a pas encore de données réelles.
 * Même pattern que l'`isUUID` déjà utilisé en interne dans DataContext.jsx —
 * extrait ici en utilitaire partagé pour que shareLink.js/trackingLink.js/
 * surveyLink.js puissent l'utiliser sans dupliquer la regex, et pour éviter
 * une tentative d'insert vouée à échouer (Postgres 22P02 "invalid input
 * syntax for type uuid") quand on passe un ID mock à une colonne uuid.
 */
export function isUUID(id) {
  return typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(id);
}

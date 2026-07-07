/**
 * T-366 : plusieurs endpoints construisaient `new RegExp(inputUtilisateur, 'i')`
 * directement depuis un paramètre de requête, sans échapper les métacaractères
 * regex — un pattern à backtracking catastrophique (ex. `(a+)+$`) pouvait
 * bloquer un thread MongoDB de façon disproportionnée (ReDoS). Échapper les
 * métacaractères avant `new RegExp()` neutralise ce vecteur : la recherche
 * reste une recherche "contient" insensible à la casse, mais n'importe quelle
 * syntaxe regex fournie par l'utilisateur est traitée comme du texte littéral.
 */
export function escapeRegExp(input) {
  return String(input).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

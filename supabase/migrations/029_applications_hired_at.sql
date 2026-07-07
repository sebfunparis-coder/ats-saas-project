-- T-370 : "temps moyen de recrutement" était calculé de 3 façons différentes,
-- toutes fausses ou vides — DashboardPage.jsx utilisait `(aujourd'hui −
-- dateApplied)` pour les candidatures `hired` (grossit indéfiniment pour un
-- candidat embauché il y a des mois) ; AnalyticsPage.jsx (KPI global) exigeait
-- déjà `a.hiredAt`, une colonne qui n'a jamais existé (KPI toujours à "—") ;
-- le rapport Time-to-Hire par mission retombait sur `a.updatedAt` puis
-- `Date.now()`, reproduisant le même biais que le Dashboard.
--
-- Corrigé en ajoutant une vraie colonne `hiredAt`, renseignée une seule fois
-- par DataContext.jsx → updateApplication() au moment précis de la transition
-- vers 'hired' — source unique désormais utilisée par les 3 calculs.

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS "hiredAt" timestamptz;

-- Vérification recommandée après exécution : faire passer une candidature de
-- test au statut "Recruté" depuis le Pipeline, vérifier que `hiredAt` se
-- renseigne, puis que le Dashboard/Analytics affichent un délai de
-- recrutement cohérent (pas "—", pas une valeur qui grossit chaque jour).

-- T-405 : aucun index sur les colonnes les plus sollicitées par les policies
-- RLS et les filtres applicatifs (company_id, status, assignedTo, profile_id).
-- Impact nul à l'échelle actuelle (comptes démo, quelques dizaines de lignes)
-- mais deviendra le goulot d'étranglement principal dès plusieurs centaines
-- de lignes par tenant : chaque contrôle RLS (`company_id = my_company_id()`)
-- et chaque filtre équipier (`assignedTo`/`profile_id`) déclenche aujourd'hui
-- un scan séquentiel complet de la table. CREATE INDEX seul ne change aucun
-- comportement (juste la vitesse de lecture) — sûr à exécuter sur une base
-- en production sans interruption de service.

CREATE INDEX IF NOT EXISTS idx_missions_company_id ON public.missions(company_id);
CREATE INDEX IF NOT EXISTS idx_missions_status ON public.missions(status);
CREATE INDEX IF NOT EXISTS idx_team_members_profile_id ON public.team_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_applications_assigned_to ON public.applications("assignedTo");
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id);

-- Bonus (même famille de problème, découvert en vérifiant les policies
-- RLS existantes) : candidates/applications sont elles aussi filtrées par
-- company_id dans absolument toutes leurs policies, sans index dédié.
CREATE INDEX IF NOT EXISTS idx_candidates_company_id ON public.candidates(company_id);
CREATE INDEX IF NOT EXISTS idx_applications_company_id ON public.applications(company_id);
CREATE INDEX IF NOT EXISTS idx_applications_mission_id ON public.applications(mission_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON public.applications(candidate_id);

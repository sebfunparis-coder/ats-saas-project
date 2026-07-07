# Comptes de test — accès validés le 2026-07-07

⚠️ **Fichier sensible** — contient des mots de passe en clair. Réservé au développement local. Ne jamais utiliser ces comptes/mots de passe en production, ne jamais partager ce fichier publiquement.

> Ces 5 comptes ont été testés individuellement (connexion réelle + chargement de l'application en navigateur) le 2026-07-07. 2 d'entre eux (Manager 6 postes, Équipier) étaient cassés depuis leur création et ont été réparés à cette occasion — voir `ticket.md` T-431.

---

## 🔴 SuperAdmin

| | |
|---|---|
| **URL** | http://localhost:3000/login |
| **Email** | `test.superadmin@ats-demo.fr` |
| **Mot de passe** | `TestSuperAdmin2026!` |
| **Accès** | Absolu — toutes les entreprises, toutes les données, aucune restriction |

Après connexion, redirection **automatique** vers `/superadmin` (interface dédiée, séparée de l'application normale). Accessible aussi via le lien "⚙️ SuperAdmin" dans le pied de page des pages publiques (landing, tarifs, etc.), une fois connecté.

---

## 👤 Client Solo

| | |
|---|---|
| **URL** | http://localhost:3000/login |
| **Email** | `test.solo@ats-demo.fr` |
| **Mot de passe** | `TestSolo2026!` |
| **Plan** | Solo |
| **Entreprise** | Agence Solo Test |
| **Accès** | Toute l'application sauf l'onglet Équipe |

---

## 👥 Client Manager — 3 postes

| | |
|---|---|
| **URL** | http://localhost:3000/login |
| **Email** | `test.manager@ats-demo.fr` |
| **Mot de passe** | `TestManager2026!` |
| **Plan** | Manager 3 postes (team_3) |
| **Entreprise** | Cabinet RH Manager (3 postes) |
| **Accès** | Toute l'application + onglet Équipe (jusqu'à 2 équipiers) |

---

## 👥 Client Manager — 6 postes

| | |
|---|---|
| **URL** | http://localhost:3000/login |
| **Email** | `test.manager6@ats-demo.fr` |
| **Mot de passe** | `TestManager2026!` |
| **Plan** | Manager 6 postes (team_6) |
| **Entreprise** | Groupe RH Premium (6 postes) |
| **Accès** | Toute l'application + onglet Équipe (jusqu'à 5 équipiers) |

---

## 🧑‍💻 Équipier

| | |
|---|---|
| **URL** | http://localhost:3000/login |
| **Email** | `test.equipier@ats-demo.fr` |
| **Mot de passe** | `TestEquipier2026!` |
| **Rôle** | Recruteur, membre de l'équipe du Manager 3 postes |
| **Entreprise** | Cabinet RH Manager (3 postes) — même entreprise que `test.manager@ats-demo.fr` |
| **Accès** | Espace personnalisé selon les droits définis par le Manager — pas d'onglet Administration, pas de vue globale équipe |

---

## Récapitulatif rapide

| Persona | Email | Mot de passe |
|---|---|---|
| SuperAdmin | test.superadmin@ats-demo.fr | TestSuperAdmin2026! |
| Solo | test.solo@ats-demo.fr | TestSolo2026! |
| Manager 3 postes | test.manager@ats-demo.fr | TestManager2026! |
| Manager 6 postes | test.manager6@ats-demo.fr | TestManager2026! |
| Équipier | test.equipier@ats-demo.fr | TestEquipier2026! |

---

## Comment relancer les serveurs locaux

```bash
# Frontend (depuis frontend/)
npm run dev   # → http://localhost:3000

# Backend (depuis backend/, optionnel — non utilisé par ces comptes, tout passe par Supabase)
npm run dev   # → http://localhost:5000
```

## Détail technique / migrations à l'origine de ces comptes

- `supabase/migrations/012_test_accounts.sql` — création initiale (Solo, Manager-3, Équipier, Manager-6)
- `supabase/migrations/036_superadmin_test_account.sql` — création du compte SuperAdmin
- `supabase/migrations/037_fix_test_personas.sql` — réparation de Manager-6 (profil/entreprise manquants) et Équipier (connexion refusée)

Voir `ticket.md` (tickets T-429, T-430, T-431) pour le détail complet des bugs trouvés et corrigés sur ces comptes.

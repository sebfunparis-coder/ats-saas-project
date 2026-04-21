# ATS SaaS Platform — Documentation Complète

> Compilation de toute la documentation du projet. Dernière mise à jour : 2026-04-21.

---

## TABLE DES MATIÈRES

1. [Vue d'ensemble du projet](#1-vue-densemble-du-projet)
2. [Architecture Frontend](#2-architecture-frontend)
3. [Architecture Backend](#3-architecture-backend)
4. [Phases réalisées — Frontend](#4-phases-réalisées--frontend)
5. [Phases réalisées — Backend](#5-phases-réalisées--backend)
6. [Intégration Frontend ↔ Backend](#6-intégration-frontend--backend)
7. [Sécurité](#7-sécurité)
8. [Upload de fichiers](#8-upload-de-fichiers)
9. [Site vitrine](#9-site-vitrine)
10. [Déploiement](#10-déploiement)
11. [Optimisations & Performance](#11-optimisations--performance)
12. [Analyse & Plan d'optimisation](#12-analyse--plan-doptimisation)
13. [Comptes de démonstration](#13-comptes-de-démonstration)

---

## 1. VUE D'ENSEMBLE DU PROJET

### Description
Plateforme SaaS ATS (Applicant Tracking System) complète pour la gestion du recrutement.

### Structure du projet (monorepo 3 couches)
```
Projet ats 13 02 2026/
├── ats-saas-project/          ← FRONTEND COMPLET (version à utiliser)
│   ├── src/
│   ├── package.json           (name: "ats-saas-platform", port 3000)
│   └── vite.config.js
├── backend/                   ← API EXPRESS + MONGODB
│   ├── src/
│   └── package.json           (name: "ats-ultimate-backend", port 5000)
└── CLAUDE.md                  ← CE FICHIER
```

### Lancer les serveurs
```bash
# Frontend (depuis ats-saas-project/)
cd ats-saas-project && npm run dev   # → http://localhost:3000

# Backend (depuis backend/)
cd backend && npm run dev            # → http://localhost:5000
```

### Stack technique
- **Frontend** : React 18.2, Vite 5, React Router v7, Context API, CSS Modules, react-helmet-async, pdfjs-dist
- **Backend** : Node.js + Express 4, MongoDB/Mongoose 8, JWT, bcrypt, multer, helmet, express-rate-limit, express-mongo-sanitize
- **Auth** : JWT (7 jours), bcrypt, account lockout (5 tentatives → 2h)
- **Multi-tenant** : Toutes les entités backend sont scopées par `companyId`

### Note MongoDB
Le backend fonctionne en **Mock Data mode** si MongoDB n'est pas installé (ECONNREFUSED ::1:27017). Ce n'est pas une erreur bloquante — comportement prévu.

---

## 2. ARCHITECTURE FRONTEND

### Organisation feature-first
```
src/
├── core/
│   ├── contexts/
│   │   ├── AuthContext.jsx       ← Auth JWT + user state
│   │   ├── DataContext.jsx       ← Données business (missions, candidats…)
│   │   ├── UIContext.jsx         ← Notifications, modales, thème
│   │   └── FiltersContext.jsx    ← Filtres persistants
│   ├── hooks/
│   │   ├── useMissions.js        ← CRUD missions (async)
│   │   ├── useCandidates.js      ← CRUD candidats (async)
│   │   └── useApplications.js   ← CRUD candidatures
│   └── utils/
│       ├── formatters.js         ← 20+ fonctions (formatDate, formatPhone…)
│       ├── validators.js
│       ├── filters.js
│       └── exporters.js
├── features/
│   ├── dashboard/       DashboardPage
│   ├── missions/        MissionsPage, MissionCard, MissionList, MissionForm, MissionDetail
│   ├── candidates/      CandidatesPage, CandidateCard, CandidateForm, CandidateDetail, ImportCSV
│   ├── pipeline/        PipelinePage, KanbanBoard, KanbanColumn, KanbanCard, ApplicationDetail
│   ├── cvtheque/        CVThequePage, CVThequeFilters, CVThequeGrid
│   ├── calendar/        CalendarPage
│   ├── team/            TeamPage
│   ├── clients/         ClientsPage, ClientDetail, ClientForm
│   ├── admin/           AdminPage
│   └── superadmin/      SuperAdminPage
├── shared/
│   └── components/
│       ├── Button (5 variants), Card, Modal, Input, Select
│       ├── AppLayout, Sidebar, Header
│       ├── FileUpload/FileUpload.jsx
│       └── index.js
├── services/
│   ├── api.js              ← Axios + interceptors JWT
│   ├── auth.service.js
│   ├── mission.service.js
│   ├── candidate.service.js
│   ├── application.service.js
│   └── index.js
└── config/
    └── routes.js
```

### 4 Contextes
| Contexte | Rôle |
|----------|------|
| AuthContext | JWT token, user, login/logout, isSuperAdmin |
| DataContext | missions, candidats, applications, clients, team, events |
| UIContext | showNotification(), modales, thème |
| FiltersContext | Filtres persistants cross-pages |

### 3 Hooks métier
- `useMissions()` — CRUD complet (toutes fonctions async)
- `useCandidates()` — CRUD complet (toutes fonctions async)
- `useApplications()` — CRUD candidatures

### Alias de chemins (vite.config.js)
```javascript
'@'       → src/
'@/core'  → src/core/
'@/features' → src/features/
'@/shared'   → src/shared/
'@/config'   → src/config/
```

### Bundle
- Port : 3000
- Taille : ~107KB gzippé
- Chunks manuels : vendor (react/react-dom), router, pdfjs

---

## 3. ARCHITECTURE BACKEND

### Structure
```
backend/
├── src/
│   ├── server.js
│   ├── config/
│   │   ├── database.js
│   │   ├── seed.js          ← Données de test
│   │   └── test-connection.js
│   ├── models/              ← 8 modèles Mongoose
│   ├── controllers/         ← 8 contrôleurs, 89 fonctions
│   ├── routes/              ← 8 fichiers routes + index.js
│   └── middleware/
│       ├── auth.middleware.js
│       ├── error.middleware.js
│       ├── validation.middleware.js
│       ├── rateLimiter.js
│       └── upload.js
└── uploads/
    ├── cvs/
    ├── documents/
    └── avatars/
```

### .env backend
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ats-ultimate
JWT_SECRET=votre_jwt_secret_super_securise_2026
JWT_REFRESH_SECRET=votre_refresh_secret_2026
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
SUPERADMIN_EMAIL=superadmin@ats-ultimate.com
SUPERADMIN_PASSWORD=SuperAdmin2026!
```

### 8 Modèles Mongoose
| Modèle | Description |
|--------|-------------|
| Company | Root multi-tenant, plans Starter/Pro/Enterprise |
| User | bcrypt password, account lockout (5 tentatives → 2h) |
| Team | Rôles (admin/recruiter/manager/viewer), permissions, stats |
| Mission | Workflow statuts, contrats, companyId |
| Candidate | Pipeline statuts, skills, cvUrl |
| Application | Statut, interviews, score |
| Client | CRM clients entreprises |
| Event | Calendrier (types: interview, meeting, deadline, phone_screen, reminder) |

### 89 Endpoints
| Contrôleur | Fonctions |
|-----------|-----------|
| auth | 6 (register, login, logout, refresh, me, resetPassword) |
| mission | 11 |
| candidate | 10 |
| application | 13 |
| client | 13 |
| team | 11 |
| event | 15 |
| user | 10 |

### Seed data (npm run db:seed)
- 3 companies, 9 users, 8 team members, 5 missions, 3 candidates, 2 clients

### Auth flow
1. `POST /api/auth/register` → crée Company + User + TeamMember
2. `POST /api/auth/login` → JWT token (7j), lockout après 5 échecs
3. Middleware `protect` → vérifie JWT sur toutes les routes
4. Middleware `authorize(roles)` → vérifie le rôle
5. Middleware `checkCompanyAccess` → isolation multi-tenant

---

## 4. PHASES RÉALISÉES — FRONTEND

### Phase 1 — Architecture & Refactoring (COMPLETE)
**Fichiers créés** :
- 4 Contexts (Auth, Data, UI, Filters)
- 3 Hooks métier (useMissions, useCandidates, useApplications)
- `core/utils/formatters.js` (20+ fonctions)
- `core/utils/validators.js`, `filters.js`, `exporters.js`
- Composants shared : Button (5 variants), Card, Modal (composition), Input, Select
- Layouts : AppLayout, Sidebar, Header

**Résultat** : Architecture feature-first, code dupliqué éliminé, -54%/-43%/-51% lignes sur pages principales

### Phase 2 — Enrichissement Site Vitrine (COMPLETE)
- `ToggleSwitch.jsx` — Switch pricing mensuel/annuel
- `Accordion.jsx` — FAQ avec 20 Q&A
- Composant SEO avec JSON-LD structured data
- 5 composants Marketing : HeroSection, FeaturesGrid, TestimonialsCarousel, PricingSection, CTASection
- CSS Modules pour toutes les pages marketing

### Phase 3 — Nouvelles Pages Site Vitrine (COMPLETE)
- `IntegrationsPage` — 32 intégrations, 6 catégories
- `BlogPage` — 12 articles avec SEO
- `CaseStudiesPage` — 8 success stories
- Toutes avec SEO (react-helmet-async + JSON-LD)

### Phase 5 — Missions (COMPLETE)
**Fichiers créés** (~800 lignes) :
- `MissionCard.jsx`
- `MissionList.jsx`
- `MissionForm.jsx` — 12 champs (titre, type_contrat, status, salaire, compétences…)
- `MissionDetail.jsx`
- `MissionsPage.jsx` — 8 filtres, toggle grid/list, export CSV, CRUD complet

### Option C — Améliorations Missions (COMPLETE)
- `Pagination.jsx` — Pagination réutilisable
- `Checkbox.jsx`
- `StatsCard.jsx` — 6 thèmes couleur, tendances
- Actions bulk (select all, delete multiple, export sélection)
- Dupliquer mission
- 4 KPIs stats

### Option B — Candidats base (COMPLETE)
- `CandidateCard.jsx`
- `CandidateList.jsx`
- `CandidatesPage.jsx` — filtres, stats, export

### Phase Candidats complète (COMPLETE)
**Fichiers créés** :
- `CandidateForm.jsx` (~330 lignes) — création/édition complet
- `CandidateDetail.jsx` (~220 lignes) — vue détaillée, notes, timeline
- `ImportCSV.jsx` (~300 lignes) — import/export CSV, bulk actions, rating candidats

### Phase 7 — Pipeline Kanban (COMPLETE)
**Fichiers créés** :
- `KanbanCard.jsx` — carte candidature draggable
- `KanbanColumn.jsx` — colonne droppable
- `KanbanBoard.jsx` — 6 colonnes, HTML5 drag & drop natif
- `ApplicationDetail.jsx` — score bar, changement statut
- `PipelinePage.jsx` — 4 KPIs, filtres par mission, export

**6 colonnes** : Nouveau → Présélectionné → Entretien → Test → Offre → Embauché

### Phase 8 — CVthèque (COMPLETE)
**Fichiers créés** :
- `CVThequeFilters.jsx` — 15+ filtres (compétences, localisation, préférences contrat, booleans)
- `CVThequeGrid.jsx` — useMemo filtering, pagination, taux de matching %
- `CVThequePage.jsx` — 4 KPIs, recherches sauvegardées (localStorage), 3 tri rapides

### Phase 9 — Dashboard (COMPLETE)
**Fichiers créés** :
- `StatsCard.jsx` — 6 thèmes couleur, tendances
- `RecentActivity.jsx` — 12 types activité, agrégation depuis missions/candidats/applications
- `QuickActions.jsx` — 4 boutons actions rapides
- `UpcomingEvents.jsx` — 6 types, labels "Aujourd'hui"/"Demain"
- `DashboardPage.jsx` — KPIs + funnel pipeline + top missions + recrutements récents

### Phase 10 — Features Restantes (COMPLETE)
**Fichiers créés** :

#### TeamPage.jsx (~280 lignes)
- Liste membres avec avatars et rôles
- Filtres : Recherche + Rôle
- Groupement par département
- Stats : Total membres, Admins, Recruteurs, Départements
- Modal détail membre + Modal invitation
- Badges rôles colorés (Admin violet, Recruiter bleu, Manager vert, Viewer gris)
- Actions admin : inviter, modifier rôle, retirer

#### ClientsPage.jsx (~250 lignes)
- Table clients avec filtres Recherche + Statut
- Stats : Total, Actifs, Prospects, Nouveaux (30j)
- CRUD complet via modales
- Statuts : Active, Prospect, Inactive
- Composants associés : `ClientDetail.jsx` (~80 lignes), `ClientForm.jsx` (~90 lignes)

#### CalendarPage.jsx (~220 lignes)
- Vue mois avec grille 7×6
- Navigation : Précédent, Aujourd'hui, Suivant
- Sélecteur vues : Jour, Semaine, Mois
- Max 3 événements par jour + "+X autres"
- Indicateur jour actuel
- Types : interview (bleu), meeting (violet), deadline (rouge), phone_screen (vert), reminder (orange)

#### AdminPage.jsx (~210 lignes)
- 4 onglets : Entreprise, Facturation, Intégrations, Sécurité
- Intégrations : LinkedIn, Gmail, Slack, Zapier
- Sécurité : 2FA, sessions actives, export RGPD, suppression compte

#### SuperAdminPage.jsx (~250 lignes)
- Vérification rôle SuperAdmin + redirection si non autorisé
- 4 onglets : Entreprises, Utilisateurs, Analytiques, Système
- Stats globales : 24 Entreprises, 156 Utilisateurs, 1 847 Missions, 8 945 Candidats
- État serveurs (API, DB, Email)

### Feature — Upload CV PDF (COMPLETE)
- Upload via base64 dans le navigateur
- `fileHandlers.js` — parsing PDF avec pdfjs-dist
- Intégré dans `CandidateForm.jsx` + `CandidateDetail.jsx`
- `FileUpload.jsx` dans shared/components

### Feature — Options dynamiques (COMPLETE)
- `CreatableSelect` composant
- Options dynamiques pour status/source/sector
- Persistance localStorage

### Hotfix — CRUD async (COMPLETE)
**Bug** : Après intégration API, les fonctions CRUD sont devenues async mais les hooks/composants les appelaient de façon synchrone.
**Fix** : `useMissions.js` et `useCandidates.js` — toutes les fonctions CRUD rendues async avec `await + try/catch`. `MissionsPage.handleFormSubmit` rendu async.

---

## 5. PHASES RÉALISÉES — BACKEND

### Phase 1 — Setup & Configuration (COMPLETE)
- `.env` configuré (PORT, MONGODB_URI, JWT secrets, SUPERADMIN credentials)
- Script seed : 3 companies, 9 users, 8 team members, 5 missions, 3 candidates, 2 clients
- Script test-connection

### Phase 1.2 — Modèles Mongoose (COMPLETE)
8 modèles créés :
- `Company` — root multi-tenant, plans Starter/Pro/Enterprise
- `User` — bcrypt hash, account lockout 5 tentatives → 2h
- `Team` — rôles, permissions, stats
- `Mission` — workflow statuts, contrats
- `Candidate` — pipeline statuts, skills, cvUrl
- `Application` — statut, interviews, score
- `Client` — CRM
- `Event` — calendrier

### Phase 1.3 — Contrôleurs (COMPLETE)
89 fonctions au total, toutes async/await, multi-tenant, pagination, populate relations.

### Phase 1.4 — Routes & Middleware (COMPLETE)
- 3 middleware : `auth.middleware.js`, `error.middleware.js`, `validation.middleware.js`
- 8 fichiers routes + `routes/index.js`
- `server.js` mis à jour

### Phase 2 — Auth Complète (COMPLETE)
- `AppError` class + error handler global
- `POST /api/auth/register` → crée Company + User + TeamMember atomiquement
- `POST /api/auth/login` → JWT + refresh token, lockout après 5 échecs (2h)
- Middleware JWT : `protect`, `authorize(roles)`, `checkCompanyAccess`
- Frontend : `AuthContext`, `auth.service.js`, intercepteurs Axios

### Phase 2.7 & 2.8 — Sécurité (COMPLETE)
Voir section [Sécurité](#7-sécurité) ci-dessous.

### Phase 3 — Upload Fichiers Local (COMPLETE)
Voir section [Upload de fichiers](#8-upload-de-fichiers) ci-dessous.

---

## 6. INTÉGRATION FRONTEND ↔ BACKEND

### Services frontend (src/services/)
```javascript
// api.js — Axios instance avec intercepteurs
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });
// Intercepteur request : ajoute Authorization: Bearer {token}
// Intercepteur response : refresh token automatique si 401

// Services disponibles
auth.service.js        → login, register, logout, me, refreshToken
mission.service.js     → getAll, getById, create, update, delete
candidate.service.js   → getAll, getById, create, update, delete
application.service.js → getAll, create, updateStatus
```

### .env frontend (ats-saas-project/)
```env
VITE_API_URL=http://localhost:5000/api
```

### Hook useAPIData (src/core/hooks/useAPIData.js — ~290 lignes)
Hook générique avec loading/error states par entité. DataContext refactorisé pour utiliser ces hooks.

### Collections Postman/Thunder Client
89 endpoints documentés et testables.

### Backend en Mock Data mode
Quand MongoDB n'est pas disponible, le backend retourne des données mockées. Les routes `/api/missions`, `/api/candidates`, `/api/applications`, `/api/users` fonctionnent toutes.

---

## 7. SÉCURITÉ

### Packages installés
- `express-mongo-sanitize` v2.2.0
- `helmet` v7.1.0
- `express-rate-limit` v7.1.5
- `xss-clean` v0.1.4
- `express-validator` v7.0.1

### Helmet CSP (server.js)
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
```
**Protège contre** : XSS, Clickjacking (X-Frame-Options: DENY), MIME sniffing (X-Content-Type-Options: nosniff)

### NoSQL Sanitization
```javascript
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`⚠️ Tentative d'injection NoSQL détectée - Key: ${key}`);
  }
}));
```
Remplace `$` et `.` par `_` dans les inputs → bloque les injections MongoDB.

### 7 Rate Limiters (middleware/rateLimiter.js)
| Limiter | Fenêtre | Max | Appliqué à |
|---------|---------|-----|------------|
| `globalLimiter` | 15 min | 100 req | Toutes routes /api |
| `authLimiter` | 15 min | 5 req | /api/auth/login + /register |
| `apiLimiter` | 1 min | 60 req | Toutes routes /api (par user ID ou IP) |
| `registrationLimiter` | 1 heure | 3 req | /api/auth/register |
| `passwordResetLimiter` | 1 heure | 3 req | /api/auth/reset-password |
| `uploadLimiter` | 15 min | 10 req | /api/upload/* |
| `sensitiveLimiter` | 1 heure | 5 req | DELETE, PUT /admin/*, /superadmin/* |

### Ordre des middlewares dans server.js
1. `globalLimiter` (100 req/15min)
2. `authLimiter` pour /auth (5 req/15min)
3. `apiLimiter` per user (60 req/min)
4. `mongoSanitize`
5. Routes handlers

### Niveau de sécurité : 90/100 (production-ready après ajout HTTPS)

### Tableau de protection
| Vulnérabilité | Statut | Protection |
|---------------|--------|------------|
| XSS | ✅ Protégé | Helmet CSP + Input validation |
| NoSQL Injection | ✅ Protégé | mongoSanitize |
| Brute Force Login | ✅ Protégé | authLimiter (5/15min) |
| Spam Registration | ✅ Protégé | registrationLimiter (3/h) |
| API Abuse | ✅ Protégé | apiLimiter (60/min) |
| Clickjacking | ✅ Protégé | X-Frame-Options: DENY |
| MIME Sniffing | ✅ Protégé | X-Content-Type-Options |

### Bug corrigé — Application.model.js ligne 174
```javascript
// ❌ AVANT
missionSchema.index({ companyId: 1, status: 1 });
// ✅ APRÈS
applicationSchema.index({ companyId: 1, status: 1 });
```

---

## 8. UPLOAD DE FICHIERS

### Backend — middleware/upload.js
3 storages Multer :

```javascript
// cvStorage
{ destination: 'uploads/cvs/', maxSize: 5MB, allowedTypes: ['PDF','DOC','DOCX','TXT'] }
// filename: cv-{sanitized}-{timestamp}-{random}.ext

// documentStorage
{ destination: 'uploads/documents/', maxSize: 10MB, allowedTypes: ['PDF','DOC','DOCX','TXT'] }

// avatarStorage
{ destination: 'uploads/avatars/', maxSize: 2MB, allowedTypes: ['JPG','PNG','GIF','WEBP'] }
```

Exports : `uploadCV`, `uploadDocument`, `uploadAvatar`, `deleteFile(filePath)`

**Sécurité** :
- Validation MIME type
- Sanitization nom fichier : `replace(/[^a-z0-9]/gi, '_').toLowerCase()`
- Nom unique : `timestamp + random`

### Backend — routes/upload.routes.js
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/upload/cv/:candidateId` | Upload CV (champ: `cv`) |
| GET | `/api/upload/cv/:filename` | Download CV sécurisé |
| DELETE | `/api/upload/cv/:candidateId` | Supprimer CV |
| POST | `/api/upload/document/:candidateId` | Upload document additionnel |
| POST | `/api/upload/avatar` | Upload avatar utilisateur |

Comportement POST cv :
1. Vérifie candidat existe + appartient à la company
2. Supprime ancien CV si existant
3. Sauvegarde nouveau CV
4. Met à jour `candidate.cvUrl`, `candidate.cvFilename`, `candidate.cvUploadedAt`

### Static files protégés (server.js)
```javascript
app.use('/uploads', protect, express.static(path.join(__dirname, '../uploads')));
```
Les fichiers ne sont accessibles que si authentifié.

### Frontend — FileUpload.jsx (shared/components/FileUpload/)
```javascript
// Props
{
  candidateId: string,
  onUploadSuccess: (data) => void,
  onUploadError: (error) => void,
  accept: string,      // '.pdf,.doc,.docx'
  maxSize: number,     // 5 * 1024 * 1024
  label: string
}
```
- Validation fichier côté client (taille + type)
- Barre de progression (XMLHttpRequest)
- Affichage nom + taille
- Reset input après succès

### Rate limiting upload
`uploadLimiter` : 10 uploads / 15 minutes

### .gitignore backend
```
uploads/
```

### Migration vers S3 (prête)
Remplacer `diskStorage` par `multerS3` + config AWS SDK.

---

## 9. SITE VITRINE

### Pages
- `/` — LandingPage
- `/features` — FeaturesPage
- `/pricing` — PricingPage
- `/integrations` — IntegrationsPage (32 intégrations, 6 catégories)
- `/blog` — BlogPage (12 articles)
- `/case-studies` — CaseStudiesPage (8 success stories)
- `/contact` — ContactPage

### Composants Marketing
- `HeroSection`, `FeaturesGrid`, `TestimonialsCarousel`, `PricingSection`, `CTASection`
- `ToggleSwitch` — pricing mensuel/annuel
- `Accordion` — FAQ 20 Q&A
- `FeatureCard`, `TestimonialCard`, `PricingCard`

### SEO
- `react-helmet-async` sur toutes les pages
- JSON-LD structured data (Organization, WebSite, Article…)
- Meta tags Open Graph, Twitter Cards

### Refactoring effectué
- CSS Modules pour toutes les pages
- Composants extraits (Navbar, Footer, FeatureCard, TestimonialCard, PricingCard)
- Responsive design
- Réduction taille fichiers : -54%/-43%/-51%

### Analyse initiale site vitrine
Problèmes identifiés (résolus) :
- Styles inline → CSS Modules
- Pas de SEO → react-helmet-async + JSON-LD
- Navigation dupliquée → composant Navbar unique
- Pas de responsive → media queries via CSS Modules

---

## 10. DÉPLOIEMENT

### Vercel (Frontend recommandé)
```bash
npm i -g vercel
cd ats-saas-project && vercel
# Set env: VITE_API_URL=https://ton-api.com/api
```

### Netlify
```bash
npm run build
# Drag & drop du dossier dist/
```

### Nginx (Production)
```nginx
server {
  listen 80;
  root /var/www/ats-saas/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api {
    proxy_pass http://localhost:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

### Variables d'environnement production
```env
# Frontend
VITE_API_URL=https://api.votre-domaine.com/api

# Backend
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=secret_tres_long_aleatoire
TRUST_PROXY=true
```

### MongoDB Atlas (gratuit)
1. Créer compte sur mongodb.com/atlas
2. Cluster M0 gratuit
3. Whitelist IP : `0.0.0.0/0`
4. Créer user DB
5. Copier connection string dans `.env`

---

## 11. OPTIMISATIONS & PERFORMANCE

### Objectifs Lighthouse
| Métrique | Cible |
|----------|-------|
| Performance | > 90 |
| Accessibility | > 95 (WCAG 2.1 AA) |
| Best Practices | > 90 |
| SEO | > 95 |

### Accessibilité (WCAG 2.1 AA)
- `accessibility.css` (~450 lignes) : focus visible, aria-labels, contraste couleurs, skip-to-content
- Toutes les interactions clavier documentées

### Analytics GA4
- `analytics.js` — configuration GA4
- `useAnalytics.js` — hook React pour tracking événements

### Performance frontend
- WebP pour les images
- Code splitting par route (React.lazy + Suspense)
- CSS Modules (pas de runtime CSS-in-JS)
- Polices système (pas de Google Fonts)
- Headers cache : `Cache-Control: public, max-age=31536000` pour assets statiques
- Chunks manuels Vite : vendor, router, pdfjs

### Performance backend
- Indexes MongoDB sur `companyId`, `status`, `createdAt`
- Pagination sur toutes les listes
- `compression` middleware (gzip)
- Populate uniquement les champs nécessaires

---

## 12. ANALYSE & PLAN D'OPTIMISATION

### Problèmes identifiés (P0)
1. **Données isolées** : SuperAdmin voit des stats différentes de l'app principale
2. **Stats hardcodées** : Compteurs statiques au lieu de calculs dynamiques
3. **Team array vide** : `useData().team` retourne `[]` dans certains contextes

### Plan d'amélioration DataContext
```javascript
// Unifier avec :
companies[]     // toutes les companies (SuperAdmin)
team[]          // membres équipe courante
campaigns[]     // campagnes recrutement
tickets[]       // support
```

### Calculs dynamiques à implémenter
- Stats dashboard depuis vraies données missions/candidats
- Compteurs pipeline calculés depuis applications
- Taux conversion calculé dynamiquement

### Synchronisation SuperAdmin ↔ Client
- SuperAdmin modifie un plan → Company.plan mis à jour → AdminPage reflète le changement
- Persistance localStorage en attendant MongoDB connecté

---

## 13. COMPTES DE DÉMONSTRATION

### SuperAdmin (accès total)
```
Email    : superadmin@ats-ultimate.com
Password : SuperAdmin2026!
```

### Admin démo (application)
```
Email    : admin@demo.com  ou  demo@techcorp.com
Password : admin2026       ou  demo123
```

### Autres comptes seed
Voir `backend/src/config/seed.js` — 9 utilisateurs créés avec rôles variés (admin, recruiter, manager, viewer).

---

## 14. MÉTRIQUES DU PROJET

| Métrique | Valeur |
|----------|--------|
| Pages principales | 12 |
| Composants frontend | 80+ |
| Lignes frontend | ~8 000+ |
| Endpoints API | 89 |
| Modèles Mongoose | 8 |
| Contrôleurs | 8 (89 fonctions) |
| Rate limiters | 7 |
| Storages Multer | 3 |
| Contextes React | 4 |
| Hooks métier | 3 |

---

## 15. ROUTES APPLICATION

### Site vitrine (public)
- `/` — Landing
- `/features`, `/pricing`, `/integrations`, `/blog`, `/case-studies`, `/contact`

### Auth
- `/login`, `/register`, `/forgot-password`

### Application (protégé)
- `/app/dashboard`
- `/app/missions`
- `/app/candidates`
- `/app/pipeline`
- `/app/cvtheque`
- `/app/calendar`
- `/app/team`
- `/app/clients`
- `/app/admin`
- `/app/superadmin` (SuperAdmin only)

---

*Documentation compilée depuis 37 fichiers .md le 2026-04-21.*

# Feuille de route — mise en ligne commerciale (2026-07-08)

> Le code applicatif est prêt (voir `CLAUDE.md` → "ACTIONS EN ATTENTE"). Tout ce qui reste ci-dessous est hors de portée du code : comptes externes à créer, formulaires à remplir, relecture humaine. Rien n'est urgent tant que le site n'est pas public — mais rien n'est possible à mettre en ligne sans passer par ces étapes.

**Ordre recommandé** : les phases sont numérotées parce que certaines en bloquent d'autres (ex. impossible de configurer l'email transactionnel sans nom de domaine). À l'intérieur d'une phase, l'ordre n'a pas d'importance.

---

## Phase 0 — Nom de domaine (bloque plusieurs autres étapes)

- [ ] Acheter un nom de domaine (ex. via OVH, Gandi, Namecheap...)
- [ ] Le pointer vers l'hébergeur du frontend (Vercel/Netlify recommandé — `frontend/vercel.json` déjà présent et prêt)
- [ ] Une fois le domaine actif : mettre à jour **Supabase → Authentication → URL Configuration → Site URL** avec la vraie URL (actuellement configuré pour `localhost`) — sans ça, les emails de confirmation/réinitialisation Supabase renverront vers `localhost` en production.

**Pourquoi en premier** : Stripe (redirection post-paiement), l'email transactionnel (domaine d'envoi) et Supabase Auth ont tous besoin d'une URL finale stable.

---

## Phase 1 — Paiement (Stripe)

Le code utilise des **Stripe Payment Links** (pas d'intégration API complexe) — voir `PaymentPage.jsx` et `frontend/.env.production`.

- [ ] Créer un compte Stripe (ou activer le compte existant)
- [ ] Créer 3 Payment Links, un par plan : Solo, Manager 3 postes, Manager 6 postes (montants dans `CLAUDE.md` § règles métier : 19,90€/29,90€, 49,90€/69,90€, 79,90€/99,90€ selon engagement)
- [ ] Dans chaque Payment Link Stripe, configurer la redirection "après paiement" vers `https://<votre-domaine>/register/confirm`
- [ ] Remplir dans `frontend/.env.production` :
  ```
  VITE_STRIPE_SOLO_PRICE_ID=...
  VITE_STRIPE_TEAM3_PRICE_ID=...
  VITE_STRIPE_TEAM6_PRICE_ID=...
  ```

---

## Phase 2 — Email transactionnel

Actuellement : **aucun email n'est réellement envoyé** (confirmation de compte, réinitialisation de mot de passe, notifications). Supabase Auth gère nativement l'envoi des emails de confirmation/reset, mais avec un expéditeur générique Supabase et des limites de volume strictes en plan gratuit.

- [ ] Créer un compte Resend ou SendGrid
- [ ] Configurer un domaine d'envoi (nécessite le domaine de la Phase 0 — enregistrements DNS SPF/DKIM)
- [ ] Brancher le fournisseur choisi dans **Supabase → Authentication → Email Templates / SMTP Settings** (remplace l'expéditeur par défaut de Supabase)
- [ ] Tester l'envoi réel : inscription, mot de passe oublié, invitation équipier

---

## Phase 3 — Juridique

**Déjà fait** : identité légale réelle renseignée dans toutes les pages légales (GETWORK, entrepreneur individuel, SIRET 524 304 714 00032, RCS Paris, TVA FR81524304714, adresse 60 rue François 1er 75008 Paris) — voir mémoire `project_identite_legale_getwork`.

**Reste à faire** :
- [ ] Renseigner un vrai numéro de téléphone professionnel (actuellement `[NUMÉRO RÉEL À COMPLÉTER]` dans les pages légales)
- [ ] Faire relire CGU / CGV / DPA / SLA par un avocat avant toute commercialisation réelle (le contenu a été rédigé mais jamais validé juridiquement)
- [ ] Vérifier la couverture RC Pro / assurance si nécessaire pour l'activité (conseil RH, code NAF 70.22Z)

---

## Phase 4 — Tracking & contenu (optionnel, améliore l'acquisition mais ne bloque pas le lancement)

Tout est déjà câblé côté code, seuls les identifiants manquent dans `frontend/.env.production` :

- [ ] **Google Analytics 4** : `VITE_GA_MEASUREMENT_ID` (analytics.google.com → Admin → Data Streams)
- [ ] **Crisp Chat** (support client en direct) : `VITE_CRISP_WEBSITE_ID` (app.crisp.chat)
- [ ] **LinkedIn Insight Tag** : `VITE_LINKEDIN_PARTNER_ID` (si publicité LinkedIn prévue)
- [ ] **Meta Pixel** : `VITE_META_PIXEL_ID` (si publicité Facebook/Instagram prévue)
- [ ] **Formspree** (formulaire de contact, solution de secours) : `VITE_FORMSPREE_ENDPOINT` — optionnel, le formulaire de contact fonctionne déjà nativement via Supabase (`contact_requests`, vérifié le 2026-07-08)
- [ ] **Contentful** (CMS du blog, optionnel) : `VITE_CONTENTFUL_SPACE_ID` / `VITE_CONTENTFUL_ACCESS_TOKEN` — sans ça, les 12 articles de blog déjà écrits en dur restent affichés, aucune régression
- [ ] **Vidéo produit** (Loom/YouTube) : `VITE_LOOM_EMBED_URL` — nécessite de filmer une démo du produit au préalable
- [ ] **Témoignages/études de cas réels** : les composants existent déjà (`TestimonialCard`, `CaseStudiesPage`) mais affichent du contenu fictif — risque légal si publiés tels quels, à remplacer par de vrais retours clients une fois les premiers utilisateurs acquis

---

## Phase 5 — Sécurité avant mise en ligne réelle

- [ ] **Changer ou supprimer les mots de passe des comptes de test** (`test.*@ats-demo.fr`, actuellement documentés en clair dans `CLAUDE.md` et `COMPTES_TEST.md`) — sans risque tant que le dépôt et la doc restent privés, mais à faire avant toute ouverture publique du dépôt ou partage de la documentation
- [ ] **Sentry** (suivi d'erreurs, optionnel mais recommandé) : `VITE_SENTRY_DSN` dans `frontend/.env.production`
- [ ] Vérifier que `frontend/.env.production` ne contient aucun `TODO` restant avant le build de production final

---

## Ce qui n'est PAS dans cette liste (déjà fait, vérifié le 2026-07-07/08)

Sécurité RLS/authentification, bugs fonctionnels, accès SuperAdmin, tests automatisés (Vitest 89/89, Jest backend 117/117), nettoyage de code mort, optimisation du bundle, historique git propre et poussé sur GitHub. Détail dans `CLAUDE.md` → "ACTIONS EN ATTENTE".

**Décisions déjà tranchées, ne pas rouvrir** : mode sombre (refusé), vérification du 2FA au niveau des policies RLS (refusé) — voir `CLAUDE.md`.

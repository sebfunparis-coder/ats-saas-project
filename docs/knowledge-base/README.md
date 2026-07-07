# ATS Ultimate — Base de connaissances (T-312)

> Structure de la base de connaissances externe. À publier sur Notion public
> (notion.so → Share → "Share to web") ou dans Intercom Articles.

## Architecture recommandée Notion

```
📚 ATS Ultimate Help Center
│
├── 🚀 Démarrage
│   ├── Créer votre compte
│   ├── Inviter votre équipe
│   ├── Créer votre première mission
│   ├── Partager votre portail carrières
│   └── Vidéo : Tour complet en 5 minutes
│
├── 📋 Pipeline & Recrutement
│   ├── Comprendre les colonnes Kanban
│   ├── Déplacer une candidature
│   ├── Grille d'évaluation structurée
│   ├── Partager un profil avec un manager
│   ├── Workflow d'approbation de mission
│   └── Clôture automatique des missions
│
├── 👥 Gestion des candidats
│   ├── Ajouter un candidat manuellement
│   ├── Parser un CV avec l'IA
│   ├── Import CSV — Guide complet
│   ├── CVthèque et recherche sémantique
│   ├── Export RGPD par candidat
│   └── Droit à l'oubli — procédure complète
│
├── 🔌 Intégrations
│   ├── Jobboards : LinkedIn, Indeed, HelloWork
│   ├── Jobboards français : APEC, Monster
│   ├── Google Calendar — setup OAuth2
│   ├── Microsoft Outlook / Teams — setup
│   ├── Zoom — créer des réunions automatiquement
│   ├── Webhooks Zapier / Make — guide complet
│   └── API publique — Documentation développeurs
│
├── ⚖️ RGPD & Conformité
│   ├── Politique anti-discrimination
│   ├── Gestion des consentements
│   ├── Export RGPD company
│   ├── DPA — Data Processing Agreement
│   └── Registre des traitements
│
├── 👨‍💻 Administration
│   ├── Rôles et permissions
│   ├── Configurer les clés API
│   ├── Configurer les webhooks
│   ├── Facturation et abonnements
│   └── Sécurité — 2FA et sessions
│
├── 📊 Analytics
│   ├── Comprendre les métriques
│   ├── Time-to-hire
│   ├── Sources de candidatures
│   └── Export PDF
│
└── 🆘 Support & FAQ
    ├── Questions fréquentes
    ├── Contacter le support
    ├── SLA et engagements
    └── Changelog
```

## Contenu prioritaire (à rédiger en premier)

1. **Créer votre premier compte** — Screenshots inclus, vidéo Loom 2 min
2. **Import CSV candidats** — Template à télécharger, exemples de mapping
3. **Pipeline Kanban** — GIF animé du drag & drop
4. **Intégrations calendrier** — Screenshots OAuth2 étape par étape
5. **RGPD** — FAQ légale + procédures

## Règles de rédaction

- Titre : action concrète ("Comment créer une mission", pas "Les missions")
- Structure : Contexte → Étapes numérotées → Résultat attendu → FAQ rapide
- Screenshots à jour (toujours inclure la version en FR et EN)
- Chaque article doit avoir une balise "Dernière mise à jour"
- Lier vers la page de statut et le support en bas de chaque article

## Setup Notion

1. Créer un workspace Notion
2. Créer une page racine "ATS Ultimate Help Center"
3. Share → "Share to web" → activer
4. Configurer le domaine custom : help.ats-ultimate.com (via Notion Sites)
5. Ajouter le lien dans Footer.jsx (atsFrontend) et dans Aide.jsx

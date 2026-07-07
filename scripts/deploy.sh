#!/bin/bash
# =============================================================
# Script de déploiement production — ATS Ultimate
# Usage : ./scripts/deploy.sh [--frontend-only | --backend-only]
# Prérequis : Node 20+, PM2, Nginx, certbot
# =============================================================

set -e  # Arrêter en cas d'erreur

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/var/log/ats-deploy-$TIMESTAMP.log"

echo "🚀 Déploiement ATS Ultimate — $(date)" | tee -a "$LOG_FILE"
echo "📁 Répertoire projet : $PROJECT_DIR" | tee -a "$LOG_FILE"

# ── Fonctions ─────────────────────────────────────────────────────────────────

check_env() {
    echo "🔍 Vérification des prérequis..." | tee -a "$LOG_FILE"
    command -v node >/dev/null || { echo "❌ Node.js non installé"; exit 1; }
    command -v npm >/dev/null || { echo "❌ npm non installé"; exit 1; }
    node_version=$(node --version | sed 's/v//')
    required_version="20.0.0"
    if [ "$(printf '%s\n' "$required_version" "$node_version" | sort -V | head -n1)" != "$required_version" ]; then
        echo "❌ Node.js $required_version+ requis (actuel: $node_version)"; exit 1
    fi
    echo "✅ Node.js $(node --version)" | tee -a "$LOG_FILE"
}

deploy_backend() {
    echo "" | tee -a "$LOG_FILE"
    echo "📦 Déploiement backend..." | tee -a "$LOG_FILE"
    cd "$PROJECT_DIR/backend"

    # Vérifier le fichier .env.production
    if [ ! -f ".env.production" ]; then
        echo "❌ backend/.env.production manquant. Copiez et configurez .env.production"
        exit 1
    fi

    # Installer les dépendances
    echo "📥 Installation dépendances backend..." | tee -a "$LOG_FILE"
    npm ci --omit=dev --quiet

    # Créer les répertoires nécessaires
    mkdir -p uploads/cvs uploads/documents uploads/avatars logs

    # Démarrer/Redémarrer avec PM2
    if pm2 describe ats-backend &>/dev/null; then
        echo "🔄 Redémarrage PM2..." | tee -a "$LOG_FILE"
        pm2 restart ats-backend --update-env
    else
        echo "▶️  Démarrage PM2..." | tee -a "$LOG_FILE"
        NODE_ENV=production pm2 start ecosystem.config.js --env production
    fi
    pm2 save
    echo "✅ Backend déployé" | tee -a "$LOG_FILE"
}

deploy_frontend() {
    echo "" | tee -a "$LOG_FILE"
    echo "🎨 Build frontend..." | tee -a "$LOG_FILE"
    cd "$PROJECT_DIR/frontend"

    # Vérifier le fichier .env.production
    if [ ! -f ".env.production" ]; then
        echo "❌ frontend/.env.production manquant. Copiez et configurez .env.production"
        exit 1
    fi

    # Installer les dépendances
    echo "📥 Installation dépendances frontend..." | tee -a "$LOG_FILE"
    npm ci --legacy-peer-deps --quiet

    # Build avec les variables de production
    echo "🔨 Build production Vite..." | tee -a "$LOG_FILE"
    NODE_ENV=production npm run build

    # Copier vers le répertoire Nginx
    NGINX_ROOT="/var/www/ats-ultimate/dist"
    if [ -d "$(dirname $NGINX_ROOT)" ] || sudo mkdir -p "$(dirname $NGINX_ROOT)"; then
        echo "📋 Copie vers $NGINX_ROOT..." | tee -a "$LOG_FILE"
        sudo mkdir -p "$NGINX_ROOT"
        sudo cp -r dist/. "$NGINX_ROOT/"
        sudo chown -R www-data:www-data "$NGINX_ROOT"
        echo "✅ Frontend déployé vers $NGINX_ROOT" | tee -a "$LOG_FILE"
    else
        echo "⚠️  Impossible de copier vers $NGINX_ROOT (pas les droits sudo ?)" | tee -a "$LOG_FILE"
        echo "   Copiez manuellement : cp -r frontend/dist/* /var/www/ats-ultimate/dist/" | tee -a "$LOG_FILE"
    fi

    # Recharger Nginx
    if command -v nginx &>/dev/null; then
        echo "🔄 Rechargement Nginx..." | tee -a "$LOG_FILE"
        nginx -t && sudo systemctl reload nginx
        echo "✅ Nginx rechargé" | tee -a "$LOG_FILE"
    fi
}

healthcheck() {
    echo "" | tee -a "$LOG_FILE"
    echo "🏥 Health check..." | tee -a "$LOG_FILE"
    sleep 3
    if curl -sf http://localhost:5000/health >/dev/null; then
        echo "✅ API backend opérationnelle" | tee -a "$LOG_FILE"
    else
        echo "❌ API backend ne répond pas — vérifiez les logs: pm2 logs ats-backend" | tee -a "$LOG_FILE"
        exit 1
    fi
}

# ── Main ──────────────────────────────────────────────────────────────────────

check_env

case "${1}" in
    --frontend-only)
        deploy_frontend
        ;;
    --backend-only)
        deploy_backend
        healthcheck
        ;;
    *)
        deploy_backend
        deploy_frontend
        healthcheck
        ;;
esac

echo "" | tee -a "$LOG_FILE"
echo "🎉 Déploiement terminé — $(date)" | tee -a "$LOG_FILE"
echo "📋 Log complet : $LOG_FILE" | tee -a "$LOG_FILE"
echo ""
echo "Commandes utiles :"
echo "  pm2 logs ats-backend    # Logs en temps réel"
echo "  pm2 monit               # Dashboard monitoring"
echo "  pm2 status              # Statut des processus"

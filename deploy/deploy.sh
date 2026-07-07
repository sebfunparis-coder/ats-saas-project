#!/bin/bash
# deploy.sh — Déploiement production sur VPS
# Usage : ./deploy/deploy.sh [--skip-build]
# Prérequis : Node 20+, PM2, Nginx, MongoDB Atlas (MONGODB_URI dans .env)

set -euo pipefail

APP_DIR="/var/www/ats-ultimate"
DIST_DIR="$APP_DIR/frontend/dist"
LOG_DIR="/var/log/ats"

echo "=== ATS Ultimate — Déploiement $(date) ==="

# 1. Pull des dernières sources
echo "[1/6] Pull git..."
git -C "$APP_DIR" pull --ff-only

# 2. Install dépendances backend
echo "[2/6] Install backend..."
cd "$APP_DIR/backend"
npm ci --omit=dev

# 3. Build frontend
if [[ "${1:-}" != "--skip-build" ]]; then
  echo "[3/6] Build frontend..."
  cd "$APP_DIR/frontend"
  npm ci --omit=dev
  npm run build
  echo "  → Build OK : $DIST_DIR"
else
  echo "[3/6] Build ignoré (--skip-build)"
fi

# 4. Créer les dossiers nécessaires
mkdir -p "$APP_DIR/backend/uploads/cvs" \
         "$APP_DIR/backend/uploads/documents" \
         "$APP_DIR/backend/uploads/avatars" \
         "$LOG_DIR"

# 5. Redémarrer le backend (zero-downtime avec PM2 reload)
echo "[5/6] Redémarrage backend..."
cd "$APP_DIR"
pm2 reload deploy/ecosystem.config.cjs --env production || \
  pm2 start deploy/ecosystem.config.cjs --env production
pm2 save

# 6. Recharger Nginx
echo "[6/6] Reload Nginx..."
nginx -t && systemctl reload nginx

echo "=== Déploiement terminé ==="
echo "  Health : https://$(hostname -f)/health"

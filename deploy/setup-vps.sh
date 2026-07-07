#!/bin/bash
# setup-vps.sh — Configuration initiale d'un VPS Ubuntu 22.04+
# Usage (root) : bash setup-vps.sh votre-domaine.com email@domaine.com

set -euo pipefail

DOMAIN="${1:?Usage: setup-vps.sh <domaine> <email>}"
EMAIL="${2:?Usage: setup-vps.sh <domaine> <email>}"
APP_DIR="/var/www/ats-ultimate"

echo "=== Setup VPS ATS Ultimate — $DOMAIN ==="

# 1. Mise à jour système
apt-get update -y && apt-get upgrade -y

# 2. Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 3. PM2
npm install -g pm2

# 4. Nginx + Certbot
apt-get install -y nginx certbot python3-certbot-nginx

# 5. Répertoires
mkdir -p "$APP_DIR" /var/log/ats
chown -R "$USER:$USER" "$APP_DIR"

# 6. Copier la config Nginx
cp "$(dirname "$0")/../nginx/ats-ultimate.conf" /etc/nginx/sites-available/ats-ultimate
# Remplacer le domaine placeholder
sed -i "s/votre-domaine.com/$DOMAIN/g" /etc/nginx/sites-available/ats-ultimate
ln -sf /etc/nginx/sites-available/ats-ultimate /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# 7. Certificat Let's Encrypt
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive

# 8. Renouvellement auto
(crontab -l 2>/dev/null; echo "0 12 * * * certbot renew --quiet && systemctl reload nginx") | crontab -

# 9. PM2 startup
pm2 startup systemd -u "$USER" --hp "$HOME" | tail -1 | bash

echo "=== Setup terminé ==="
echo "  Placez le code dans $APP_DIR"
echo "  Copiez backend/.env.example → backend/.env et configurez les variables"
echo "  Puis lancez : ./deploy/deploy.sh"

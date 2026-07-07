#!/bin/bash
# =============================================================
# Script de setup initial VPS — ATS Ultimate
# À exécuter UNE SEULE FOIS sur un VPS Ubuntu 22.04 vierge.
# Usage : sudo bash scripts/setup-vps.sh
# =============================================================

set -e
echo "🖥️  Setup VPS ATS Ultimate — $(date)"

# ── Mise à jour système ───────────────────────────────────────────────────────
apt-get update -y && apt-get upgrade -y

# ── Node.js 20 via nvm ───────────────────────────────────────────────────────
echo "📦 Installation Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
echo "✅ Node.js $(node --version)"

# ── PM2 ──────────────────────────────────────────────────────────────────────
npm install -g pm2
pm2 startup systemd -u root --hp /root
echo "✅ PM2 $(pm2 --version)"

# ── Nginx ────────────────────────────────────────────────────────────────────
apt-get install -y nginx
systemctl enable nginx
echo "✅ Nginx $(nginx -v 2>&1 | head -1)"

# ── Certbot (Let's Encrypt SSL) ───────────────────────────────────────────────
apt-get install -y certbot python3-certbot-nginx
echo "✅ Certbot prêt"
echo ""
echo "   Obtenir les certificats SSL :"
echo "   certbot --nginx -d ats-ultimate.com -d api.ats-ultimate.com"

# ── Répertoires ───────────────────────────────────────────────────────────────
mkdir -p /app/ats-ultimate
mkdir -p /var/www/ats-ultimate/dist
mkdir -p /var/log/nginx
chown -R www-data:www-data /var/www/ats-ultimate

# ── Firewall ──────────────────────────────────────────────────────────────────
apt-get install -y ufw
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable
echo "✅ Firewall configuré (SSH + HTTP + HTTPS)"

# ── Copier les configs Nginx ──────────────────────────────────────────────────
echo ""
echo "📋 Configuration Nginx :"
echo "   Copiez nginx/ats-ultimate.conf → /etc/nginx/sites-available/"
echo "   Copiez nginx/api.ats-ultimate.conf → /etc/nginx/sites-available/"
echo "   ln -s /etc/nginx/sites-available/ats-ultimate.conf /etc/nginx/sites-enabled/"
echo "   ln -s /etc/nginx/sites-available/api.ats-ultimate.conf /etc/nginx/sites-enabled/"
echo "   nginx -t && systemctl reload nginx"

echo ""
echo "🎉 Setup VPS terminé !"
echo ""
echo "Prochaines étapes :"
echo "  1. Cloner le repo dans /app/ats-ultimate/"
echo "  2. Copier backend/.env.production et frontend/.env.production"
echo "  3. Obtenir les certificats SSL : certbot --nginx -d ats-ultimate.com -d api.ats-ultimate.com"
echo "  4. Configurer Nginx (voir ci-dessus)"
echo "  5. Exécuter : ./scripts/deploy.sh"

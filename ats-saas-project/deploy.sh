#!/bin/bash

# Script de déploiement pour ATS SaaS Platform
# Usage: ./deploy.sh [dev|prod]

set -e

ENV=${1:-prod}

echo "🚀 Déploiement ATS SaaS - Mode: $ENV"
echo "=========================================="

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
if [ "$ENV" = "prod" ]; then
    SERVER_USER="votre-user"
    SERVER_HOST="votreserveur.com"
    SERVER_PATH="/var/www/ats-saas"
else
    SERVER_USER="dev-user"
    SERVER_HOST="dev.votreserveur.com"
    SERVER_PATH="/var/www/ats-saas-dev"
fi

echo -e "${YELLOW}📦 Installation des dépendances...${NC}"
npm install

echo -e "${YELLOW}🔨 Build de l'application...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build réussi${NC}"
else
    echo -e "${RED}❌ Erreur lors du build${NC}"
    exit 1
fi

echo -e "${YELLOW}📤 Envoi des fichiers sur le serveur...${NC}"

# Créer une archive
tar -czf dist.tar.gz -C dist .

# Envoyer sur le serveur
scp dist.tar.gz $SERVER_USER@$SERVER_HOST:/tmp/

# Déployer sur le serveur
ssh $SERVER_USER@$SERVER_HOST << 'ENDSSH'
    set -e
    
    # Backup de l'ancienne version
    if [ -d /var/www/ats-saas ]; then
        echo "💾 Backup de l'ancienne version..."
        sudo cp -r /var/www/ats-saas /var/www/ats-saas-backup-$(date +%Y%m%d-%H%M%S)
    fi
    
    # Créer le dossier si nécessaire
    sudo mkdir -p /var/www/ats-saas
    
    # Extraire la nouvelle version
    echo "📂 Extraction des fichiers..."
    sudo tar -xzf /tmp/dist.tar.gz -C /var/www/ats-saas
    
    # Permissions
    sudo chown -R www-data:www-data /var/www/ats-saas
    sudo chmod -R 755 /var/www/ats-saas
    
    # Nettoyer
    rm /tmp/dist.tar.gz
    
    # Recharger Nginx
    echo "🔄 Rechargement de Nginx..."
    sudo nginx -t && sudo systemctl reload nginx
    
    echo "✅ Déploiement terminé!"
ENDSSH

# Nettoyer localement
rm dist.tar.gz

echo -e "${GREEN}=========================================="
echo -e "✅ Déploiement réussi!${NC}"
echo ""
echo "🌐 Votre application est accessible sur:"
if [ "$ENV" = "prod" ]; then
    echo "   https://votredomaine.com"
else
    echo "   https://dev.votredomaine.com"
fi
echo ""
echo "📊 Vérifiez les logs avec:"
echo "   ssh $SERVER_USER@$SERVER_HOST 'sudo tail -f /var/log/nginx/ats-saas-access.log'"

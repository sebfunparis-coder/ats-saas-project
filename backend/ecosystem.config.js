/**
 * PM2 Ecosystem — ATS Ultimate Backend
 * Usage :
 *   pm2 start ecosystem.config.js         # Démarrer
 *   pm2 restart ats-backend --update-env  # Redémarrer + recharger .env
 *   pm2 logs ats-backend                  # Logs en temps réel
 *   pm2 monit                             # Dashboard monitoring
 *   pm2 save && pm2 startup               # Démarrage automatique au boot
 */

export default {
  apps: [
    {
      name: 'ats-backend',
      script: 'src/server.js',
      instances: 'max',          // Utilise tous les CPUs disponibles (cluster mode)
      exec_mode: 'cluster',
      node_args: '--max-old-space-size=512',

      // Variables d'environnement — remplacer par vos vraies valeurs
      // Ou utiliser : pm2 start ecosystem.config.js --env production
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
        // Les secrets doivent être dans .env.production (chargé par dotenv dans server.js)
        // ou injectés directement ici si le fichier .env n'est pas disponible sur le serveur
      },

      // Redémarrage automatique
      autorestart: true,
      watch: false,              // Ne pas watcher en production (trop gourmand)
      max_memory_restart: '512M',
      restart_delay: 3000,       // Attendre 3s avant redémarrage

      // Gestion des logs
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
      log_type: 'json',

      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,
      shutdown_with_message: true,

      // Healthcheck via PM2
      min_uptime: '10s',
      max_restarts: 10,
    },
  ],
};

// PM2 ecosystem config — démarrage production
// Usage : pm2 start ecosystem.config.cjs --env production
// pm2 save && pm2 startup

module.exports = {
  apps: [
    {
      name: 'ats-backend',
      script: './backend/src/server.js',
      interpreter: 'node',
      interpreter_args: '--experimental-vm-modules',
      cwd: '/var/www/ats-ultimate',
      instances: 'max',           // cluster mode, 1 process par CPU
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '500M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      // Logs
      out_file: '/var/log/ats/out.log',
      error_file: '/var/log/ats/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],
};

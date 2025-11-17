module.exports = {
  apps: [{
    name: 'lumi-billing',
    script: 'npm',
    args: 'start',
    cwd: process.cwd(),
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      // SQLite optimizations
      NODE_OPTIONS: '--max-old-space-size=512'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    // Zero-downtime reload
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000
  }]
}

# Deploying Lumi Billing V2 to DirectAdmin Subdomain

## Prerequisites Checklist

Before deploying, ensure your DirectAdmin server has:
- ✅ **Node.js 18+** installed
- ✅ **npm** or **yarn** package manager
- ✅ **PM2** process manager (recommended)
- ✅ **SSH access** to your server
- ✅ **Subdomain created** in DirectAdmin (e.g., `billing.yourdomain.com`)

---

## Step-by-Step Deployment Guide

### 1. Prepare Your Server

**SSH into your DirectAdmin server**:
```bash
ssh username@your-server.com
```

**Check Node.js version** (must be 18 or higher):
```bash
node --version
```

If Node.js is not installed or version is too old:
```bash
# Install Node.js 20.x (recommended)
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Or for Ubuntu/Debian:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Install PM2 globally** (keeps your app running):
```bash
npm install -g pm2
```

---

### 2. Setup Subdomain in DirectAdmin

1. Log into DirectAdmin
2. Go to **Account Manager → Subdomain Setup**
3. Create subdomain: `billing` (or your preferred name)
4. Note the document root: usually `/home/username/domains/yourdomain.com/public_html/billing`
5. The subdomain will be: `billing.yourdomain.com`

---

### 3. Upload Your Application

**Option A: Using Git (Recommended)**
```bash
cd /home/username/domains/yourdomain.com/
git clone https://github.com/yourusername/LumiBillingV2.git billing
cd billing
```

**Option B: Using FTP/SFTP**
1. Compress your local project: `LumiBillingV2.zip`
2. Upload via DirectAdmin File Manager or FTP client
3. Extract in `/home/username/domains/yourdomain.com/billing`

**Option C: Using SCP from your local machine**
```bash
# Run this from your local machine
scp -r C:\Users\james\OneDrive\Desktop\LumiBillingV2 username@your-server.com:/home/username/domains/yourdomain.com/billing
```

---

### 4. Configure Environment Variables

Navigate to your app directory:
```bash
cd /home/username/domains/yourdomain.com/billing
```

Create `.env` file:
```bash
nano .env
```

Add your configuration (copy from `.env.example` and fill in real values):
```env
# Database - SQLite (file-based, no server needed)
DATABASE_URL="file:./production.db"

Note: If you set `DATABASE_URL` to a MySQL/MariaDB connection string, prefer the following format and remove any surrounding quotes if you export the variable at the shell or set it via DirectAdmin configurations. Example for `.env`:

DATABASE_URL=mysql://lumiuser:YOUR_PASSWORD@127.0.0.1:3306/lumidb

If you export a shell variable directly in your environment, do NOT include surrounding quotes (they will become part of the value):

export DATABASE_URL=mysql://lumiuser:YOUR_PASSWORD@127.0.0.1:3306/lumidb

Use `npm run prisma:check-env` to see what Prisma will detect at runtime and avoid surprises.
> Note: If you switch to Postgres for production, use `127.0.0.1` instead of `localhost` in your `DATABASE_URL` to force a TCP connection and avoid socket auth issues.

# NextAuth - IMPORTANT: Change these!
NEXTAUTH_URL="https://billing.yourdomain.com"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# Stripe (if using)
STRIPE_SECRET_KEY="sk_live_your_real_key"
STRIPE_PUBLISHABLE_KEY="pk_live_your_real_key"
STRIPE_WEBHOOK_SECRET="whsec_your_real_secret"

# PayPal (if using)
PAYPAL_CLIENT_ID="your_live_client_id"
PAYPAL_CLIENT_SECRET="your_live_secret"
PAYPAL_WEBHOOK_ID="your_webhook_id"
PAYPAL_MODE="live"

# Server Integrations (optional)
PTERODACTYL_URL="https://panel.yourdomain.com"
PTERODACTYL_API_KEY="ptla_your_key"

DIRECTADMIN_URL="https://your-server.com:2222"
DIRECTADMIN_USERNAME="admin"
DIRECTADMIN_PASSWORD="your_password"
DIRECTADMIN_API_VERSION="v2"

VIRTFUSION_URL="https://vf.yourdomain.com"
VIRTFUSION_API_KEY="your_key"
```

**Generate NEXTAUTH_SECRET**:
```bash
openssl rand -base64 32
```

Save and exit (Ctrl+X, then Y, then Enter)

---

### 5. Install Dependencies

```bash
npm install --production
```

This will install all required packages.

---

### 6. Setup Database

```bash
# Generate Prisma client
npm run prisma:generate

# Create database and run migrations
npm run prisma:push

# Seed initial data (admin user, etc.)
npm run prisma:seed

If you're using MySQL/MariaDB, prefer the explicit MySQL commands provided in `package.json` and validate your environment first:

```bash
# Check what Prisma sees
npm run prisma:check-env

# Push schema using MySQL-specific schema file
npm run prisma:push:mysql

# Seed using MySQL schema
npm run prisma:seed:mysql
```

If you prefer to run one-off commands, pass the URL inline so you know the runtime env Prisma sees:

```bash
DATABASE_URL=mysql://user:pass@23.150.24.24:3306/dbname npx prisma db push --schema=prisma/schema.mysql.prisma
DATABASE_URL=mysql://user:pass@23.150.24.24:3306/dbname npx prisma db seed --schema=prisma/schema.mysql.prisma
```
```

**Default Admin Credentials** (change after first login!):
- Email: `admin@example.com`
- Password: `admin123`

---

### 7. Build for Production

```bash
npm run build
```

This creates optimized production files in `.next` folder.

---

### 8. Configure Reverse Proxy (CRITICAL)

Next.js runs on port 3000 by default. You need to proxy subdomain traffic to this port.

**Create `.htaccess` in subdomain root**:
```bash
nano /home/username/domains/yourdomain.com/public_html/billing/.htaccess
```

Add this content:
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    
    # Proxy all requests to Next.js on port 3000
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
</IfModule>
```

**If you need a custom port** (in case 3000 is taken):
1. Edit `package.json` and change start script:
   ```json
   "start": "next start -p 3001"
   ```
2. Update `.htaccess` to use port 3001

---

### 9. Start Application with PM2

Navigate to app directory:
```bash
cd /home/username/domains/yourdomain.com/billing
```

**Create PM2 ecosystem file**:
```bash
nano ecosystem.config.js
```

Add this content:
```javascript
module.exports = {
  apps: [{
    name: 'lumi-billing',
    script: 'npm',
    args: 'start',
    cwd: '/home/username/domains/yourdomain.com/billing',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
```

**Create logs directory**:
```bash
mkdir -p logs
```

**Start the application**:
```bash
pm2 start ecosystem.config.js
```

**Save PM2 configuration**:
```bash
pm2 save
pm2 startup
# Follow the command output to enable auto-start on server reboot
```

---

### 10. Verify Deployment

**Check if app is running**:
```bash
pm2 status
pm2 logs lumi-billing
```

**Test locally on server**:
```bash
curl http://localhost:3000
```

**Access from browser**:
```
https://billing.yourdomain.com
```

You should see the Lumi Billing login page!

---

### 11. Setup SSL Certificate (HTTPS)

**Option A: DirectAdmin AutoSSL**
1. In DirectAdmin, go to **Advanced Features → SSL Certificates**
2. Enable **Let's Encrypt** for your subdomain
3. Wait for automatic certificate generation
4. Your site will be accessible via HTTPS

**Option B: Manual Let's Encrypt**
```bash
sudo certbot --apache -d billing.yourdomain.com
```

---

### 12. Configure Webhooks (Important!)

After deployment, update webhook URLs in:

**Stripe**:
1. Go to https://dashboard.stripe.com/webhooks
2. Update webhook URL to: `https://billing.yourdomain.com/api/stripe/webhook`

**PayPal**:
1. Go to https://developer.paypal.com
2. Update webhook URL to: `https://billing.yourdomain.com/api/paypal/webhook`

---

## Common PM2 Commands

```bash
# View status
pm2 status

# View logs
pm2 logs lumi-billing

# View realtime logs
pm2 logs lumi-billing --lines 100

# Restart app
pm2 restart lumi-billing

# Stop app
pm2 stop lumi-billing

# Delete app from PM2
pm2 delete lumi-billing

# Monitor resources
pm2 monit
```

---

## Updating Your Application

When you make changes:

```bash
# 1. SSH to server
ssh username@your-server.com

# 2. Navigate to app directory
cd /home/username/domains/yourdomain.com/billing

# 3. Pull latest changes (if using Git)
git pull origin main

# 4. Install any new dependencies
npm install --production

# 5. Rebuild Prisma client (if schema changed)
npm run prisma:generate
npm run prisma:push

# 6. Rebuild app
npm run build

# 7. Restart with PM2
pm2 restart lumi-billing

# 8. Verify
pm2 logs lumi-billing
```

---

## Troubleshooting

### App won't start
**Check logs**:
```bash
pm2 logs lumi-billing --err
```

**Common issues**:
- Node version too old: `node --version` (needs 18+)
- Port already in use: Change port in `ecosystem.config.js`
- Database error: Check `DATABASE_URL` in `.env`
- Missing dependencies: Run `npm install`

### 502 Bad Gateway
**Causes**:
- App not running: `pm2 status`
- Wrong port in `.htaccess`: Verify port matches PM2 config
- Proxy not enabled: Contact hosting provider to enable `mod_proxy`

### Database errors
**Reset database**:
```bash
rm production.db
npm run prisma:push
npm run prisma:seed
```

### Can't access site
**Check DNS**:
```bash
ping billing.yourdomain.com
```

**Check subdomain in DirectAdmin**:
- Verify subdomain is active
- Check document root is correct

### Permissions issues
### PM2: "Cannot find module '/var/www/...' .next/standalone/server.js"

If you see logs like `Cannot find module '/var/www/lumibilling/.next/standalone/server.js'`, this means PM2 is trying to run Next's standalone server but it doesn't exist. Possible reasons and fixes:

- The `next build` step failed or produced files in a different location — re-run `npm run build` and confirm `.next/standalone/server.js` exists:
  ```bash
  # From your app directory
  NODE_ENV=production npm run build
  ls -la .next/standalone
  # You should see server.js or similar inside
  ```

- If you are using the ecosystem file, restart the app with the fresh config (this ensures pm2 picks up `npm start` instead of a manual node /server path):
  ```bash
  pm2 delete lumi-billing || true
  pm2 start ecosystem.config.js
  pm2 save
  ```

- To check the environment that PM2 is using (which can affect Prisma):
  ```bash
  pm2 env lumi-billing
  pm2 show lumi-billing
  ```

- After updating `.env`, always use `--update-env` when restarting to force pm2 to pick up new values:
  ```bash
  pm2 restart lumi-billing --update-env
  ```

If `ls -la .next/standalone` shows nothing or the folder doesn't exist, rerun the build and ensure `output: 'standalone'` is in `next.config.js` (it is by default in this repo). If you're still stuck, try starting with `npm start` manually to see verbose errors:
```bash
NODE_ENV=production npm start
``` 
```bash
# Fix ownership
chown -R username:username /home/username/domains/yourdomain.com/billing

# Fix permissions
chmod -R 755 /home/username/domains/yourdomain.com/billing
chmod 600 .env
```

---

## Performance Optimization

### Enable Production Optimizations

**In `.env`**:
```env
NODE_ENV=production
```

**PM2 Cluster Mode** (for better performance):
Edit `ecosystem.config.js`:
```javascript
instances: 'max', // Use all CPU cores
exec_mode: 'cluster'
```

Then restart:
```bash
pm2 restart lumi-billing
```

### Caching Headers

Add to `.htaccess`:
```apache
# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType text/javascript "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

---

## Security Checklist

- [ ] Changed default admin password
- [ ] Generated strong `NEXTAUTH_SECRET`
- [ ] Using HTTPS (SSL certificate installed)
- [ ] `.env` file has correct permissions (600)
- [ ] Database file not in public directory
- [ ] Firewall configured (if applicable)
- [ ] Regular backups configured
- [ ] Webhook signature verification enabled
- [ ] Rate limiting configured (optional)

---

## Backup Strategy

**Database Backup** (SQLite):
```bash
# Create backup script
nano /home/username/backup-billing.sh
```

Add:
```bash
#!/bin/bash
BACKUP_DIR="/home/username/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_PATH="/home/username/domains/yourdomain.com/billing/production.db"

mkdir -p $BACKUP_DIR
cp $DB_PATH $BACKUP_DIR/billing_$DATE.db

# Keep only last 7 days
find $BACKUP_DIR -name "billing_*.db" -mtime +7 -delete
```

Make executable and add to cron:
```bash
chmod +x /home/username/backup-billing.sh
crontab -e
```

Add daily backup at 2 AM:
```
0 2 * * * /home/username/backup-billing.sh
```

---

## Alternative: Using Node.js Selector in DirectAdmin

Some DirectAdmin installations have **Node.js Selector**:

1. In DirectAdmin, go to **Advanced Features → Select Node.js Version**
2. Select Node.js 18 or higher
3. Enable for your subdomain
4. Set start command: `npm start`
5. Set working directory: `/home/username/domains/yourdomain.com/billing`
6. Click **Start**

This manages the process without PM2.

---

## Need Help?

**Check logs first**:
```bash
# Application logs
pm2 logs lumi-billing

# System logs
tail -f /var/log/httpd/error_log

# DirectAdmin logs
tail -f /var/log/directadmin/error.log
```

**Test port availability**:
```bash
netstat -tulpn | grep 3000
```

**Test app manually**:
```bash
cd /home/username/domains/yourdomain.com/billing
PORT=3000 npm start
```

---

## Summary

Your Lumi Billing V2 is now **production-ready** with:
✅ All payment integrations (Stripe, PayPal)
✅ All server provisioning (Pterodactyl, DirectAdmin, VirtFusion)
✅ Complete audit logging
✅ Dark mode support
✅ Responsive design
✅ Security features
✅ Production optimizations

**Deployment takes ~15-30 minutes** following this guide.

Once deployed, you can:
- Accept payments via Stripe and PayPal
- Automatically provision servers/hosting/VPS
- Manage clients and invoices
- Track everything in audit logs

**Your billing system is ready to go live!** 🚀

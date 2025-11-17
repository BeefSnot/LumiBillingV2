# Pre-Deployment Checklist for Lumi Billing V2

## Before You Deploy

### 1. Environment Configuration ✓
- [ ] Copy `.env.example` to `.env`
- [ ] Generate `NEXTAUTH_SECRET` (run: `openssl rand -base64 32`)
- [ ] Update `NEXTAUTH_URL` to your subdomain URL
- [ ] Add Stripe keys (if using Stripe payments)
- [ ] Add PayPal credentials (if using PayPal payments)
- [ ] Configure server integration credentials (optional)

### 2. Server Requirements ✓
- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm package manager installed (`npm --version`)
- [ ] PM2 installed globally (`pm2 --version` or install: `npm install -g pm2`)
- [ ] SSH access to DirectAdmin server
- [ ] Subdomain created in DirectAdmin

### 3. DirectAdmin Setup ✓
- [ ] Subdomain created (e.g., `billing.yourdomain.com`)
- [ ] Document root noted (usually `/home/username/domains/yourdomain.com/public_html/billing`)
- [ ] SSL certificate configured (Let's Encrypt recommended)
- [ ] Apache mod_proxy enabled (contact host if not sure)

### 4. Database ✓
- [ ] SQLite is used (no separate database server needed)
- [ ] Database file will be created at: `./production.db`
- [ ] Database is NOT in public web directory (security)

---

## Deployment Steps Checklist

### Step 1: Upload Files ✓
- [ ] Files uploaded to: `/home/username/domains/yourdomain.com/billing`
- [ ] All files present (use Git, FTP, or SCP)
- [ ] `.env` file created with production values

### Step 2: Install Dependencies ✓
```bash
cd /home/username/domains/yourdomain.com/billing
npm install --production
```
- [ ] Dependencies installed successfully
- [ ] No error messages

### Step 3: Database Setup ✓
```bash
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```
- [ ] Prisma client generated
- [ ] Database created and migrations applied
- [ ] Seed data created (admin user)

### Step 4: Build Application ✓
```bash
npm run build
```
- [ ] Build completed successfully
- [ ] `.next` folder created
- [ ] No TypeScript errors

### Step 5: Configure Reverse Proxy ✓
Create `.htaccess` in subdomain public root:
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
</IfModule>
```
- [ ] `.htaccess` file created
- [ ] Proxy rules configured
- [ ] Port matches PM2 configuration

### Step 6: Start with PM2 ✓
```bash
mkdir -p logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```
- [ ] Logs directory created
- [ ] PM2 started successfully
- [ ] PM2 configured to auto-start on reboot
- [ ] Run the command shown by `pm2 startup`

### Step 7: Verify Deployment ✓
```bash
pm2 status
pm2 logs lumi-billing
curl http://localhost:3000
```
- [ ] PM2 shows app as "online"
- [ ] No errors in logs
- [ ] Local curl returns HTML
- [ ] Site accessible at `https://billing.yourdomain.com`

### Step 8: Configure Webhooks ✓
**Stripe**:
- [ ] Updated webhook URL to: `https://billing.yourdomain.com/api/stripe/webhook`
- [ ] Webhook secret added to `.env`

**PayPal**:
- [ ] Updated webhook URL to: `https://billing.yourdomain.com/api/paypal/webhook`
- [ ] Webhook ID added to `.env`
- [ ] Subscribed to required events

### Step 9: Security Configuration ✓
```bash
chmod 600 .env
chmod -R 755 /home/username/domains/yourdomain.com/billing
```
- [ ] `.env` file permissions set to 600 (owner read/write only)
- [ ] Application files have correct permissions
- [ ] SSL certificate installed and working
- [ ] HTTPS redirect enabled

### Step 10: First Login ✓
Visit: `https://billing.yourdomain.com/login`

**Default admin credentials**:
- Email: `admin@example.com`
- Password: `admin123`

- [ ] Successfully logged in as admin
- [ ] Changed default admin password
- [ ] Admin dashboard loads correctly
- [ ] All menu items accessible

---

## Post-Deployment Verification

### Functionality Tests ✓
- [ ] User registration works
- [ ] Email verification works
- [ ] Login/logout works
- [ ] Admin panel accessible
- [ ] Client panel accessible
- [ ] Dark mode toggle works
- [ ] Create test product
- [ ] Create test invoice
- [ ] Payment processing (test mode)
- [ ] Audit logs recording events
- [ ] Search functionality works

### Payment Gateway Tests ✓
**Stripe** (if enabled):
- [ ] Test checkout session creation
- [ ] Complete test payment
- [ ] Webhook received
- [ ] Invoice status updated
- [ ] Audit log entry created

**PayPal** (if enabled):
- [ ] Test order creation
- [ ] PayPal redirect works
- [ ] Payment capture works
- [ ] Webhook received
- [ ] Invoice status updated

### Provisioning Tests ✓
**If using server integrations**:
- [ ] Test Pterodactyl connection
- [ ] Test DirectAdmin connection
- [ ] Test VirtFusion connection
- [ ] Test service provisioning
- [ ] Verify external resources created

---

## Performance & Monitoring

### Performance Checks ✓
```bash
pm2 monit  # Monitor CPU/Memory
pm2 logs lumi-billing --lines 100  # Check logs
```
- [ ] Memory usage acceptable (<500MB typical)
- [ ] CPU usage reasonable
- [ ] No memory leaks
- [ ] Response times fast (<2s)

### Setup Monitoring ✓
- [ ] Configure PM2 to send email on crash
- [ ] Setup uptime monitoring (UptimeRobot, etc.)
- [ ] Configure log rotation
- [ ] Setup daily database backups

### Backup Configuration ✓
```bash
# Create backup script
nano /home/username/backup-billing.sh

#!/bin/bash
BACKUP_DIR="/home/username/backups"
DATE=$(date +%Y%m%d_%H%M%S)
cp /home/username/domains/yourdomain.com/billing/production.db $BACKUP_DIR/billing_$DATE.db
find $BACKUP_DIR -name "billing_*.db" -mtime +7 -delete
```
- [ ] Backup script created
- [ ] Made executable: `chmod +x backup-billing.sh`
- [ ] Added to cron: `0 2 * * * /home/username/backup-billing.sh`
- [ ] Test backup manually

---

## Troubleshooting Guide

### If site shows 502 Bad Gateway:
```bash
pm2 status  # Check if app is running
pm2 restart lumi-billing
pm2 logs lumi-billing --err
```

### If app won't start:
```bash
cd /home/username/domains/yourdomain.com/billing
node --version  # Check Node version (needs 18+)
npm install  # Reinstall dependencies
npm run build  # Rebuild app
pm2 delete lumi-billing
pm2 start ecosystem.config.js
```

### If database errors:
```bash
rm production.db  # WARNING: Deletes all data
npm run prisma:push
npm run prisma:seed
pm2 restart lumi-billing
```

### If port conflict:
Edit `ecosystem.config.js` and change PORT to 3001, 3002, etc.
Update `.htaccess` to match new port.

---

## Quick Commands Reference

```bash
# Check status
pm2 status

# View logs (realtime)
pm2 logs lumi-billing

# Restart app
pm2 restart lumi-billing

# Stop app
pm2 stop lumi-billing

# Monitor resources
pm2 monit

# Update application
cd /home/username/domains/yourdomain.com/billing
git pull origin main  # If using Git
npm install --production
npm run build
pm2 restart lumi-billing

# Backup database
cp production.db production.db.backup

# View environment
pm2 env lumi-billing
```

---

## Support Resources

- **Deployment Guide**: `DEPLOYMENT_DIRECTADMIN.md`
- **Integration Setup**: `INTEGRATIONS.md`
- **PayPal Setup**: `PAYPAL_SETUP.md`
- **Feature List**: `FEATURES.md`
- **Quick Start**: `QUICKSTART.md`

---

## Final Checklist Before Going Live

- [ ] All tests passed
- [ ] Default admin password changed
- [ ] Backup system configured
- [ ] Monitoring setup complete
- [ ] SSL certificate valid
- [ ] Webhooks configured and tested
- [ ] Payment gateways in LIVE mode (not test/sandbox)
- [ ] Email service configured
- [ ] Privacy policy added (if required)
- [ ] Terms of service added (if required)
- [ ] Contact information updated

---

## You're Ready! 🚀

Once all checkboxes are complete:
1. Your billing system is live
2. You can accept real payments
3. Automated provisioning is active
4. All features are operational

**Need help?** Check the deployment guide or logs first.

**Success Tips**:
- Monitor logs daily for first week
- Test payment flow with small amount first
- Keep regular backups
- Update webhooks if domain changes
- Restart PM2 after server reboots (auto-startup should handle this)

# 🚀 Quick Start Guide

## Run Lumi Billing in 3 Easy Steps!

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup Database & Test Data
```bash
npm run setup
```
This creates the SQLite database, tables, and adds test accounts.

### Step 3: Start the Server
```bash
npm run dev
```

## 🎉 You're Done!

Open **http://localhost:3000** in your browser

### Login Credentials

**Admin Panel:**
- Email: `admin@lumisolutions.tech`
- Password: `admin123`
- URL: http://localhost:3000/admin

**Client Portal:**
- Email: `client@example.com`
- Password: `client123`
- URL: http://localhost:3000/client

## Alternative: One-Line Setup

Use the bash script to do everything automatically:
```bash
chmod +x start.sh && ./start.sh
```

## What You Get

- ✅ Full admin dashboard with analytics
- ✅ Client portal for customers
- ✅ Invoice & payment management
- ✅ Support ticket system
- ✅ Product & service management
- ✅ DirectAdmin, Virtfusion & Pterodactyl integrations
- ✅ Automated provisioning system
- ✅ Beautiful blue/white UI

## Need Help?

See `SETUP.md` for detailed instructions or troubleshooting.

---

# 🚀 Production Deployment - DirectAdmin

## Deploy to Your Subdomain in 10 Minutes

### Prerequisites
- ✅ DirectAdmin hosting with SSH access
- ✅ Node.js 18+ installed on server
- ✅ Subdomain created (e.g., `billing.yourdomain.com`)

### Quick Deploy Steps

**1. Upload Files (2 min)**
```bash
ssh username@your-server.com
cd /home/username/domains/yourdomain.com/
git clone YOUR_REPO_URL billing
cd billing
```

**2. Configure Environment (2 min)**
```bash
cp .env.example .env
nano .env
```
Update these:
```env
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="https://billing.yourdomain.com"
DATABASE_URL="file:./production.db"
```

**3. Deploy (3 min)**
```bash
chmod +x deploy.sh
./deploy.sh
```

**4. Setup Reverse Proxy (1 min)**
```bash
cd /home/username/domains/yourdomain.com/public_html/billing
cp ../../billing/.htaccess.example .htaccess
```

**5. Enable Auto-Start (1 min)**
```bash
pm2 startup  # Run the command it shows
pm2 save
```

**6. Access Your Site! 🎉**

Visit: `https://billing.yourdomain.com`

**Default Login**: `admin@example.com` / `admin123`

### Quick Commands
```bash
pm2 status                    # Check status
pm2 logs lumi-billing        # View logs
pm2 restart lumi-billing     # Restart app
```

### Troubleshooting
- **502 Error**: `pm2 restart lumi-billing`
- **Won't start**: `pm2 logs lumi-billing --err`
- **Port conflict**: Edit `ecosystem.config.js` PORT value

**Full deployment guide**: See `DEPLOYMENT_DIRECTADMIN.md`

**Deployment checklist**: See `DEPLOYMENT_CHECKLIST.md`


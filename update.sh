#!/bin/bash

# ========================================
# Lumi Billing - Zero Downtime Update Script
# ========================================
# This script updates your application with ZERO downtime
# Run: ./update.sh

set -e  # Exit on error

echo "🔄 Starting Lumi Billing update..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get current directory
APP_DIR=$(pwd)

# Step 1: Backup database
echo -e "${BLUE}📦 Step 1/7: Backing up database...${NC}"
if [ -f "prisma/dev.db" ]; then
  cp prisma/dev.db "prisma/dev.db.backup.$(date +%Y%m%d_%H%M%S)"
  echo -e "${GREEN}✓ Database backed up${NC}"
fi
if [ -f "production.db" ]; then
  cp production.db "production.db.backup.$(date +%Y%m%d_%H%M%S)"
  echo -e "${GREEN}✓ Production database backed up${NC}"
fi

# Step 2: Pull latest code
echo -e "${BLUE}📥 Step 2/7: Pulling latest code...${NC}"
git fetch origin
git pull origin main || git pull origin master
echo -e "${GREEN}✓ Code updated${NC}"

# Step 3: Install dependencies
echo -e "${BLUE}📦 Step 3/7: Installing dependencies...${NC}"
npm install --production=false
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 4: Run database migrations
echo -e "${BLUE}🗄️  Step 4/7: Running database migrations...${NC}"
npx prisma migrate deploy
echo -e "${GREEN}✓ Migrations complete${NC}"

# Step 5: Build application
echo -e "${BLUE}🔨 Step 5/7: Building application...${NC}"
npm run build
echo -e "${GREEN}✓ Build complete${NC}"

# Step 6: Reload PM2 with zero downtime
echo -e "${BLUE}🔄 Step 6/7: Reloading application (zero downtime)...${NC}"
if command -v pm2 &> /dev/null; then
  pm2 reload lumi-billing --update-env
  echo -e "${GREEN}✓ Application reloaded${NC}"
else
  echo -e "${YELLOW}⚠️  PM2 not found, skipping reload${NC}"
  echo -e "${YELLOW}   Run manually: pm2 reload lumi-billing${NC}"
fi

# Step 7: Clean up
echo -e "${BLUE}🧹 Step 7/7: Cleaning up...${NC}"
npm prune --production
echo -e "${GREEN}✓ Cleanup complete${NC}"

echo ""
echo -e "${GREEN}✅ Update completed successfully!${NC}"
echo ""
echo -e "${BLUE}📊 Application Status:${NC}"
if command -v pm2 &> /dev/null; then
  pm2 status lumi-billing
  echo ""
  echo -e "${BLUE}💾 Memory Usage:${NC}"
  pm2 show lumi-billing | grep -E "memory|cpu|uptime"
fi

echo ""
echo -e "${GREEN}🎉 Your application is now running the latest version!${NC}"
echo ""
echo -e "${YELLOW}📝 Quick Commands:${NC}"
echo "  View logs:    pm2 logs lumi-billing"
echo "  Restart:      pm2 restart lumi-billing"
echo "  Stop:         pm2 stop lumi-billing"
echo "  Status:       pm2 status"
echo ""

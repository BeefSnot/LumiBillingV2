#!/bin/bash

# Lumi Billing V2 - Production Deployment Script
# Run this script on your DirectAdmin server after uploading files

set -e  # Exit on any error

echo "========================================"
echo "  Lumi Billing V2 Deployment Script"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}! $1${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    print_warning "Please don't run as root. Run as your user account."
    exit 1
fi

echo "Step 1: Checking prerequisites..."
echo "-----------------------------------"

# Check Node.js version
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    echo "Please install Node.js 18+ first"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version $NODE_VERSION is too old. Need 18+"
    exit 1
fi
print_success "Node.js $(node -v) found"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
print_success "npm $(npm -v) found"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 is not installed"
    echo "Installing PM2 globally..."
    npm install -g pm2
    print_success "PM2 installed"
else
    print_success "PM2 $(pm2 -v) found"
fi

echo ""
echo "Step 2: Checking .env file..."
echo "-----------------------------------"

if [ ! -f ".env" ]; then
    print_warning ".env file not found"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    print_warning "IMPORTANT: Edit .env file with your production values!"
    echo "Press Enter to continue after editing .env..."
    read
else
    print_success ".env file exists"
fi

# Check critical env vars
if grep -q "your-secret-key-here-change-in-production" .env; then
    print_error "NEXTAUTH_SECRET not configured!"
    echo "Run: openssl rand -base64 32"
    echo "Then update NEXTAUTH_SECRET in .env"
    exit 1
fi

if grep -q "http://localhost:3000" .env; then
    print_warning "NEXTAUTH_URL still set to localhost"
    echo "Update NEXTAUTH_URL in .env to your production URL"
    echo "Press Enter to continue..."
    read
fi

# Warn if DATABASE_URL uses 'localhost' (socket vs TCP auth can cause failures)
if grep -E -q "postgres(q|ql)?://[^@]+@localhost" .env; then
    print_warning "DATABASE_URL uses 'localhost' — this can cause authentication issues because 'localhost' may use a Unix socket."
    echo "If you're deploying on a Linux VPS and you see Prisma "
    echo "authentication errors, update .env to use 127.0.0.1 instead of localhost."
    echo "Example: postgres://lumiuser:pwd@127.0.0.1:5432/lumidb?schema=public"
fi

print_success "Environment configured"

echo ""
echo "Step 3: Installing dependencies..."
echo "-----------------------------------"

npm install
print_success "Dependencies installed"

echo ""
echo "Step 4: Setting up database..."
echo "-----------------------------------"

npm run prisma:generate
print_success "Prisma client generated"

npm run prisma:push
print_success "Database schema applied"

npm run prisma:seed
print_success "Database seeded"

echo ""
echo "Step 5: Build steps (pre-build checks and build)..."
echo "-----------------------------------"
npm run prebuild
npm run build
print_success "Application built successfully"

echo ""
echo "Step 6: Creating logs directory..."
echo "-----------------------------------"

mkdir -p logs
print_success "Logs directory created"

echo ""
echo "Step 7: Setting permissions..."
echo "-----------------------------------"

chmod 600 .env
print_success "Secured .env file (chmod 600)"

chmod -R 755 .
print_success "Set directory permissions"

echo ""
echo "Step 8: Starting application with PM2..."
echo "-----------------------------------"

# Stop if already running
if pm2 list | grep -q "lumi-billing"; then
    print_warning "Application already running. Restarting..."
    pm2 restart lumi-billing
else
    pm2 start ecosystem.config.js
fi

pm2 save
print_success "PM2 configuration saved"

echo ""
print_warning "IMPORTANT: Run this command to enable auto-start on reboot:"
pm2 startup

echo ""
echo "Step 9: Verification..."
echo "-----------------------------------"

sleep 2  # Give app time to start

if pm2 list | grep -q "online"; then
    print_success "Application is running!"
else
    print_error "Application failed to start. Check logs:"
    echo "  pm2 logs lumi-billing"
    exit 1
fi

# Test if app responds
if curl -s http://localhost:3000 > /dev/null; then
    print_success "Application responding on port 3000"
else
    print_warning "Application may not be responding yet. Check logs:"
    echo "  pm2 logs lumi-billing"
fi

echo ""
echo "========================================"
echo "  Deployment Complete! 🚀"
echo "========================================"
echo ""
echo "Default Admin Credentials:"
echo "  Email: admin@example.com"
echo "  Password: admin123"
echo ""
echo "IMPORTANT: Change the admin password after first login!"
echo ""
echo "Useful Commands:"
echo "  pm2 status              - Check app status"
echo "  pm2 logs lumi-billing   - View logs"
echo "  pm2 restart lumi-billing - Restart app"
echo "  pm2 monit               - Monitor resources"
echo ""
echo "Next Steps:"
echo "1. Configure reverse proxy (.htaccess)"
echo "2. Setup SSL certificate"
echo "3. Configure payment webhooks"
echo "4. Change admin password"
echo "5. Test payment flow"
echo ""
echo "See DEPLOYMENT_DIRECTADMIN.md for detailed instructions"
echo ""

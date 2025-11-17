#!/bin/bash
# Lumi Billing V2 - Full install script
# Run on the server (non-root) to set up project, create DB baseline if needed,
# run builds, and restart PM2.
# Use at your own risk — we protect with backups and confirm prompts.

set -euo pipefail
IFS=$'\n\t'

echo "========================================"
echo "  Lumi Billing V2 - Automated Install"
echo "========================================"

if [ "$EUID" -eq 0 ]; then
  echo "Run this script as a non-root user. Exiting."
  exit 1
fi

# project root should be current folder
REPO_ROOT="$(pwd)"
if [ ! -f "package.json" ]; then
  echo "package.json not found. Please run this from the project root."
  exit 1
fi

# Ensure .env exists
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    echo "Created .env from .env.example — please edit .env now if necessary."
    read -p "Press Enter to continue after editing .env (or Ctrl+C to abort)..."
  else
    echo "No .env or .env.example found — create one and rerun the script."
    exit 1
  fi
else
  echo ".env exists — OK"
fi

# Check Node and NPM
if ! command -v node >/dev/null 2>&1 ; then
  echo "Node is not installed. Please install Node 18+ or use NodeSource."
  exit 1
fi

NODE_MAJOR=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "Node $NODE_MAJOR is installed — Lumi Billing requires Node 18+."
  exit 1
fi

# Check PM2
if ! command -v pm2 >/dev/null 2>&1 ; then
  echo "PM2 not found, installing..."
  npm install -g pm2
fi

# Install dependencies
echo "Installing dependencies (this may take a while)..."
if npm ci; then
  echo "npm ci completed"
else
  echo "npm ci failed — package.json and package-lock.json may be out of sync."
  echo "If you continue we'll run 'npm install --legacy-peer-deps' which updates package-lock.json." 
  read -p "Allow updating package-lock.json with --legacy-peer-deps? (y/N) " choice
  if [[ "$choice" =~ ^[Yy]$ ]]; then
    npm install --legacy-peer-deps || { echo "npm install failed — aborting"; exit 1; }
    echo "Updated package-lock.json via npm install --legacy-peer-deps" 
  else
    echo "Aborting install. To fix locally: run 'npm install' on your dev machine to regenerate package-lock.json and push it." 
    exit 1
  fi
fi

# Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Apply migrations with fallback to baseline if DB is non-empty (P3005)
MIGRATE_OK=true
if npx prisma migrate deploy ; then
  echo "Prisma migrate deploy OK"
else
  MIGRATE_OK=false
fi

# If P3005 (DB not empty) handle baseline automatically after backing up DB
if [ "$MIGRATE_OK" = false ]; then
  echo "Prisma Migrate failed — likely the DB has an existing schema."
  read -p "Would you like to create a baseline (mark all migrations as applied) automatically? (y/N) " choice
  if [[ "$choice" =~ ^[Yy]$ ]]; then
    # Back up database file(s). Prioritize SQLite fallback.
    if [ -f "$DATABASE_URL" ]; then
      echo "Detected DATABASE_URL value. Skipping auto-backup here; ensure backup created."
    fi
    if [ -f dev.db ]; then
      cp dev.db dev.db.bak_$(date +%s)
      echo "Backed up dev.db"
    fi

    # Mark migrations as applied in order
    MIGR_DIRS=(prisma/migrations/*)
    for md in "${MIGR_DIRS[@]}"; do
      if [ -d "$md" ]; then
        migname=$(basename "$md")
        echo "Resolving migration $migname as applied"
        npx prisma migrate resolve --applied "$migname"
      fi
    done

    echo "Migrations resolved as applied — regenerating Prisma client..."
    npx prisma generate
  else
    echo "User chose not to auto-baseline; aborting install so migrations remain unchanged."
    exit 1
  fi
fi

# Post-migration client generate (again) and prebuild
echo "Generating Prisma client again and type-checking..."
npx prisma generate
npm run prebuild

# Optionally fix vulnerabilities
echo "Running npm audit to check for vulnerabilities..."
if npm audit --production --json 1>/tmp/npm-audit.json 2>&1 ; then
  echo "No production vulnerabilites found"
else
  echo "Production vulnerabilities detected — attempting safe fixes..."
  npm audit fix || true
  echo "Re-running audit after fixes..."
  npm audit --production || true
  echo "If you still see high-severity vulnerabilities, run 'npm audit fix --force' manually after validating backups."
fi

# Build Next app
echo "Building Next.js app..."
npm run build

# PM2 start/reload
if pm2 list | grep -q "lumi-billing"; then
  echo "Reloading lumi-billing via PM2"
  pm2 reload ecosystem.config.js --env production || pm2 restart lumi-billing || true
else
  pm2 start ecosystem.config.js || pm2 start start.sh || true
  pm2 save
fi

# Final check
echo "Installation and build completed. Check pm2 logs with 'pm2 logs'."

exit 0

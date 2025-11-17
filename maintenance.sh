#!/bin/bash

# ========================================
# Database Maintenance Script
# Run weekly: crontab -e
# 0 3 * * 0 /path/to/maintenance.sh
# ========================================

set -e

echo "🔧 Running database maintenance..."

# Backup first
echo "📦 Creating backup..."
cp production.db "backups/production.db.$(date +%Y%m%d_%H%M%S)"

# Optimize database
echo "⚡ Optimizing database..."
sqlite3 production.db << EOF
PRAGMA optimize;
VACUUM;
ANALYZE;
EOF

# Show database info
echo "📊 Database stats:"
sqlite3 production.db "PRAGMA page_count; PRAGMA page_size; PRAGMA freelist_count;"

echo "✅ Maintenance complete!"

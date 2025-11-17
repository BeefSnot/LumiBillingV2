#!/bin/bash

echo "🚀 Starting Lumi Billing Setup..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run prisma:generate
echo ""

# Push database schema
echo "💾 Setting up database..."
npm run prisma:push
echo ""

# Seed database
echo "🌱 Seeding database with test data..."
npm run prisma:seed
echo ""

echo "✅ Setup complete!"
echo ""
echo "🎉 Starting development server..."
echo ""
echo "📝 Login credentials:"
echo "   Admin: admin@lumisolutions.tech / admin123"
echo "   Client: client@example.com / client123"
echo ""
echo "🌐 Opening http://localhost:3000"
echo ""

npm run dev

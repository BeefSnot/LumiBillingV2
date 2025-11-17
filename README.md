# Lumi Billing

A modern, full-featured billing panel for Lumi Solutions - similar to WHMCS and Blesta, but built with cutting-edge technologies.

## Features

- 🎨 Modern blue/white themed UI
- 👥 Complete admin dashboard
- 🛍️ Client portal for service management
- 💳 Automated invoicing and payment processing (Stripe)
- 🔄 Automated service provisioning
- 🎫 Support ticket system
- 🔌 API integrations:
  - DirectAdmin (latest API)
  - Virtfusion
  - Pterodactyl

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **UI**: Tailwind CSS + Shadcn/ui components
- **Payment**: Stripe

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- That's it! SQLite is built-in (no database installation needed)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Setup database:
```bash
# No database installation needed! Using SQLite

# Generate Prisma client and create database
npm run setup

# Or run each step manually:
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

3. Run development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Test Admin Account

After running the seed script, you can login with:
- **Email**: admin@lumisolutions.tech
- **Password**: admin123

## Configuration

Edit `.env` file to configure:
- Database connection
- API keys for DirectAdmin, Virtfusion, Pterodactyl
- Stripe keys for payments
- NextAuth secret

## Project Structure

```
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── lib/             # Utility functions and configurations
│   └── types/           # TypeScript type definitions
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Database seeding script
└── public/              # Static assets
```

## Company

Built for [Lumi Solutions](https://lumisolutions.tech)

## License

Proprietary - All rights reserved

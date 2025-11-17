# Lumi Billing - Setup Instructions

## Prerequisites

Before you begin, make sure you have:
- Node.js 18+ and npm

**That's it!** SQLite is built-in, no database installation needed.

## Installation Steps

### 1. Install Dependencies

In your WSL terminal, run:

```bash
npm install
```

This will install all required packages including Next.js, Prisma, NextAuth, Tailwind CSS, and all UI components.

### 2. Setup Database (Automatic with SQLite!)

Run the setup script to automatically configure everything:

```bash
npm run setup
```

This single command will:
- Generate Prisma client
- Create SQLite database (dev.db)
- Create all tables
- Seed test data

Or run each step manually:
```bash
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

### 3. Start Development Server

Start the development server:

```bash
npm run dev
```

Or use the convenience script:
```bash
chmod +x start.sh
./start.sh
```

Open your browser and navigate to: **http://localhost:3000**

## Test Accounts

The seed script creates these accounts:

- **Admin Account**: admin@lumisolutions.tech / admin123
- **Test Client**: client@example.com / client123

## Login Credentials

### Admin Panel
- **URL**: http://localhost:3000/admin
- **Email**: admin@lumisolutions.tech
- **Password**: admin123

### Client Portal
- **URL**: http://localhost:3000/client
- **Email**: client@example.com
- **Password**: client123

## Project Structure

```
lumi-billing/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data script
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── client/            # Client portal pages
│   │   ├── api/               # API routes
│   │   └── login/             # Login page
│   ├── components/
│   │   └── ui/                # Shadcn UI components
│   ├── lib/
│   │   ├── integrations/      # API clients (DA, VF, PT)
│   │   ├── services/          # Business logic
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── prisma.ts          # Prisma client
│   │   └── utils.ts           # Utility functions
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
└── package.json               # Dependencies and scripts
```

## Features

### Admin Dashboard
- Dashboard with key metrics (clients, services, revenue)
- Client management
- Product & service management
- Invoice management
- Support ticket system
- Server management (DirectAdmin, Virtfusion, Pterodactyl)
- Automated provisioning
- Settings configuration

### Client Portal
- Personal dashboard
- Service management and details
- Invoice viewing and payment
- Support ticket system
- Service ordering

### Integrations
- **DirectAdmin**: Web hosting account provisioning
- **Virtfusion**: VPS provisioning
- **Pterodactyl**: Game server provisioning
- **Stripe**: Payment processing (configure your keys)

## Next Steps

### 1. Configure API Integrations

Update `.env` with your actual server credentials:
- DirectAdmin server details
- Virtfusion API key
- Pterodactyl API key

### 2. Setup Stripe

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe dashboard
3. Update `.env` with your keys
4. Configure webhook endpoints for automated payment handling

### 3. Customize Products

Access the admin panel and:
- Update products with your actual offerings
- Set correct pricing
- Link products to your servers
- Configure billing cycles

### 4. Production Deployment

When ready for production:

1. **Update environment variables**:
   - Change `NEXTAUTH_SECRET` to a secure random string
   - Update `NEXTAUTH_URL` to your production URL
   - Use production Stripe keys
   - Set production database URL

2. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

3. **Deploy to**:
   - Vercel (recommended for Next.js)
   - Railway
   - AWS/DigitalOcean/Linode
   - Any Node.js hosting platform

## Troubleshooting

### Dependencies Installation Issues
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

### Prisma Issues
- Delete database and recreate: `rm prisma/dev.db && npm run setup`
- Clear Prisma cache: `npx prisma generate`

### Port Already in Use
- Change port: `PORT=3001 npm run dev`
- Or kill the process using port 3000

## Support

For issues or questions about Lumi Billing:
- Company: Lumi Solutions
- Website: https://lumisolutions.tech

## License

Proprietary - All rights reserved by Lumi Solutions

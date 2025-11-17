# Integration Setup Guide

This guide covers setting up Stripe, DirectAdmin, VirtFusion, and Pterodactyl integrations.

## 🔧 Prerequisites

Before setting up integrations, run the following commands to ensure the database schema is up to date:

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

The first command regenerates the Prisma client after schema changes, the second applies the schema to your database, and the third seeds the database with test data.

---

## 💳 Stripe Payment Integration

### 1. Create a Stripe Account
- Go to [stripe.com](https://stripe.com) and create an account
- Use test mode for development

### 2. Get API Keys
1. Navigate to **Developers → API keys**
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)

### 3. Set Up Webhook
1. Go to **Developers → Webhooks**
2. Click **Add endpoint**
3. Set URL to: `https://your-domain.com/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
5. Click **Add endpoint**
6. Click **Reveal** next to **Signing secret** and copy it (starts with `whsec_`)

### 4. Configure in Admin Panel
1. Log in to admin panel: `/admin/settings`
2. Under **Payment Settings**, enter:
   - **Stripe Publishable Key**: Your `pk_test_...` key
   - **Stripe Secret Key**: Your `sk_test_...` key
   - **Stripe Webhook Secret**: Your `whsec_...` secret
3. Click **Save Changes**

### 5. Test Payment Flow
1. Create an invoice in `/admin/invoices`
2. Go to `/client/invoices` and click **Pay**
3. Use Stripe test card: `4242 4242 4242 4242`
4. Invoice should automatically update to PAID status

---

## 🌐 DirectAdmin Integration

DirectAdmin is used for web hosting provisioning (cPanel/Plesk alternative).

### 1. Get DirectAdmin API Access
1. Log into your DirectAdmin panel as admin
2. Go to **Account Manager → Manage User Levels**
3. Create a new reseller account or use admin credentials
4. Note down:
   - Server URL (e.g., `https://server.example.com:2222`)
   - Admin username
   - Admin password

### 2. Add DirectAdmin Server
1. Go to `/admin/servers`
2. Click **Create Server**
3. Fill in:
   - **Name**: e.g., "DirectAdmin Server 1"
   - **Type**: Select **DirectAdmin**
   - **API URL**: Your DirectAdmin URL with port (e.g., `https://server.example.com:2222`)
   - **Username**: Admin or reseller username
   - **Password**: Admin or reseller password
   - **Status**: Active
4. Click **Test Connection** to verify credentials
5. Click **Create**

### 3. Create Products Using DirectAdmin
1. Go to `/admin/products`
2. Click **Create Product**
3. Fill in product details:
   - **Server**: Select your DirectAdmin server
   - **Disk Space (MB)**: e.g., 5000 (5GB)
   - **Bandwidth (MB)**: e.g., 50000 (50GB)
   - **Type**: Hosting
4. When a client orders this product, an account will be automatically created on DirectAdmin

### 4. Test Provisioning
1. Create a test service in `/admin/services`
2. Service should provision automatically on DirectAdmin
3. Check DirectAdmin panel to verify account was created

---

## 🖥️ VirtFusion Integration

VirtFusion is used for VPS/VM provisioning.

### 1. Get VirtFusion API Access
1. Log into your VirtFusion panel
2. Go to **Settings → API**
3. Click **Create API Key**
4. Copy the API key (starts with long alphanumeric string)
5. Note your panel URL (e.g., `https://panel.example.com`)

### 2. Add VirtFusion Server
1. Go to `/admin/servers`
2. Click **Create Server**
3. Fill in:
   - **Name**: e.g., "VirtFusion Node 1"
   - **Type**: Select **VirtFusion**
   - **API URL**: Your VirtFusion panel URL (e.g., `https://panel.example.com`)
   - **API Key**: Your API key from step 1
   - **Status**: Active
4. Click **Test Connection** to verify credentials
5. Click **Create**

### 3. Create Products Using VirtFusion
1. Go to `/admin/products`
2. Click **Create Product**
3. Fill in product details:
   - **Server**: Select your VirtFusion server
   - **RAM (MB)**: e.g., 2048 (2GB)
   - **Disk Space (MB)**: e.g., 25000 (25GB)
   - **CPU Cores**: e.g., 2
   - **Bandwidth (MB)**: e.g., 1000000 (1TB)
   - **Type**: VPS
4. When a client orders this product, a VPS will be automatically created

### 4. Test Provisioning
1. Create a test service for VPS product
2. VPS should be created automatically in VirtFusion
3. Check VirtFusion panel to verify VM was created

---

## 🎮 Pterodactyl Integration

Pterodactyl is used for game server provisioning.

### 1. Get Pterodactyl API Access
1. Log into your Pterodactyl panel as admin
2. Go to **Account → API Credentials**
3. Click **Create API Key**
4. Under **Application API**, create a key with `read & write` permissions
5. Copy the API key (starts with `ptla_`)
6. Note your panel URL (e.g., `https://panel.example.com`)

### 2. Add Pterodactyl Server
1. Go to `/admin/servers`
2. Click **Create Server**
3. Fill in:
   - **Name**: e.g., "Pterodactyl Panel"
   - **Type**: Select **Pterodactyl**
   - **API URL**: Your Pterodactyl panel URL (e.g., `https://panel.example.com`)
   - **API Key**: Your application API key from step 1
   - **Status**: Active
4. Click **Test Connection** to verify credentials
5. Click **Create**

### 3. Create Products Using Pterodactyl
1. Go to `/admin/products`
2. Click **Create Product**
3. Fill in product details:
   - **Server**: Select your Pterodactyl server
   - **RAM (MB)**: e.g., 4096 (4GB)
   - **Disk Space (MB)**: e.g., 10000 (10GB)
   - **CPU Cores**: e.g., 200 (200% CPU)
   - **Type**: Game Server
4. When a client orders this product, a game server will be automatically created

### 4. Test Provisioning
1. Create a test service for game server product
2. Server should be created automatically in Pterodactyl
3. Check Pterodactyl panel to verify server was created

---

## 🔍 Testing Server Connections

You can test server connections before saving them:

1. Go to `/admin/servers`
2. Click **Create Server** or **Edit** existing server
3. Fill in all connection details
4. Click **Test Connection**
5. Green checkmark = Success ✓
6. Red X = Failed connection (check credentials)

---

## 📊 Integration Features

### Automatic Provisioning
- **Service Creation**: When a service status changes to `ACTIVE`, the system automatically provisions resources on the linked server
- **Suspension**: Changing service status to `SUSPENDED` suspends the account on the server
- **Termination**: Changing service status to `TERMINATED` deletes the account from the server

### Manual Provisioning
- Admins can manually provision services from the services page
- Edit service and change status to trigger provisioning

### Credential Management
- All server credentials are stored in the database
- Credentials are encrypted in transit (HTTPS required for production)
- Each server can have unique credentials
- Support for multiple servers of the same type

---

## 🔐 Security Best Practices

1. **Use HTTPS**: Always use SSL certificates in production
2. **Strong Passwords**: Use complex passwords for all API accounts
3. **IP Restrictions**: Configure IP whitelist on DirectAdmin/VirtFusion/Pterodactyl if possible
4. **Regular Backups**: Backup your database regularly
5. **Monitor Logs**: Check logs for failed API calls
6. **Test Mode**: Always test integrations in test/staging environment first
7. **API Key Rotation**: Rotate API keys periodically

---

## 🐛 Troubleshooting

### Stripe Issues
- **Webhook not working**: Check webhook URL is publicly accessible
- **Payment fails**: Ensure secret key matches environment
- **Invoice not updating**: Check webhook logs in Stripe dashboard

### DirectAdmin Issues
- **Connection failed**: Verify admin/reseller has API access enabled
- **Account creation fails**: Check if reseller has enough resources
- **SSL errors**: Use `https://` prefix and correct port (usually 2222)

### VirtFusion Issues
- **API key invalid**: Regenerate API key in VirtFusion panel
- **Server creation fails**: Check if you have available IP addresses and resources
- **Connection timeout**: Verify VirtFusion URL is correct and accessible

### Pterodactyl Issues
- **Permission denied**: Ensure API key has Application-level permissions
- **Allocation errors**: Ensure you have available allocations on nodes
- **User creation fails**: Check if email domain is not blacklisted

### General Issues
- **Test connection fails**: Double-check URL format, credentials, and network access
- **Provisioning not triggering**: Ensure service status is set to ACTIVE
- **Database errors**: Run `npx prisma generate && npx prisma db push`

---

## 📝 Environment Variables (Optional)

While the admin panel stores settings in the database, you can also use environment variables as defaults:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# DirectAdmin (optional - can configure per-server in admin panel)
DIRECTADMIN_URL=https://server.example.com:2222
DIRECTADMIN_USERNAME=admin
DIRECTADMIN_PASSWORD=your_password

# VirtFusion (optional - can configure per-server in admin panel)
VIRTFUSION_URL=https://panel.example.com
VIRTFUSION_API_KEY=your_api_key

# Pterodactyl (optional - can configure per-server in admin panel)
PTERODACTYL_URL=https://panel.example.com
PTERODACTYL_API_KEY=ptla_your_api_key
```

Database settings take precedence over environment variables for server-specific configurations.

---

## ✅ Integration Checklist

- [ ] Run `npx prisma generate && npx prisma db push`
- [ ] Set up Stripe account and add keys to admin panel
- [ ] Configure Stripe webhook endpoint
- [ ] Add DirectAdmin server (if using web hosting)
- [ ] Add VirtFusion server (if using VPS)
- [ ] Add Pterodactyl server (if using game servers)
- [ ] Test each server connection using "Test Connection" button
- [ ] Create products linked to servers
- [ ] Test provisioning with a sample service
- [ ] Verify accounts are created on respective panels
- [ ] Test payment flow end-to-end
- [ ] Monitor logs for any errors

---

## 🎯 Quick Start

1. **Run database commands**:
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

2. **Log in as admin**: `admin@lumisolutions.tech` / `admin123`

3. **Add Stripe keys**: Go to `/admin/settings` → Payment Settings

4. **Add a server**: Go to `/admin/servers` → Create Server → Test Connection

5. **Create a product**: Go to `/admin/products` → Create Product → Link to server

6. **Test order flow**: 
   - Log in as client: `client@example.com` / `client123`
   - Order product from `/client/products`
   - Pay invoice with Stripe test card
   - Check if service was provisioned

---

**Need Help?** Check the logs in your terminal for detailed error messages. All API calls are logged for debugging.

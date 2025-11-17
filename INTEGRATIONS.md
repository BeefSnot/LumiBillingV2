# Payment Gateway & Server Provisioning Integrations

## Overview
This document describes all the integrations available in Lumi Billing V2, including payment gateways and server provisioning systems.

## Payment Gateways

### Stripe (✅ Fully Implemented)
- **Status**: Production Ready
- **Features**:
  - Checkout sessions
  - Webhook handling
  - Invoice payment processing
  - Automatic status updates
  - Audit logging

**Setup**:
1. Get API keys from https://dashboard.stripe.com
2. Add to `.env`:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```
3. Configure webhook URL: `https://yourdomain.com/api/stripe/webhook`

### PayPal (✅ Fully Implemented)
- **Status**: Production Ready
- **Features**:
  - Order creation with invoice items
  - Payment capture
  - Webhook handling for payment events
  - Automatic refund detection
  - Audit logging

**Setup**:
1. Create app at https://developer.paypal.com
2. Add to `.env`:
```env
PAYPAL_CLIENT_ID=your-client-id
PAYPAL_CLIENT_SECRET=your-client-secret
PAYPAL_WEBHOOK_ID=your-webhook-id
PAYPAL_MODE=sandbox # or "live"
```
3. Configure webhook URL: `https://yourdomain.com/api/paypal/webhook`
4. Subscribe to events:
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.DENIED`
   - `PAYMENT.CAPTURE.REFUNDED`

**API Endpoints**:
- `POST /api/paypal/checkout` - Create PayPal order
- `GET /api/paypal/capture` - Capture approved payment
- `POST /api/paypal/webhook` - Handle PayPal events

## Server Provisioning

### Pterodactyl (✅ Fully Implemented)
Game server control panel integration.

- **Status**: Production Ready
- **Features**:
  - Create/delete servers
  - Suspend/unsuspend servers
  - Update server resources
  - Reinstall servers
  - List servers, locations, eggs, nests
  - Server build configuration

**Setup**:
1. Get API key from Pterodactyl Panel (Admin → API)
2. Add to `.env`:
```env
PTERODACTYL_URL=https://panel.example.com
PTERODACTYL_API_KEY=ptla_...
```

**Available Methods**:
```typescript
const client = new PterodactylClient()

// Server Management
await client.createServer({ name, userId, eggId, memory, disk, cpu, ... })
await client.getServer(serverId)
await client.suspendServer(serverId)
await client.unsuspendServer(serverId)
await client.deleteServer(serverId, force)
await client.reinstallServer(serverId)
await client.updateServerBuild(serverId, { memory, disk, cpu })
await client.listServers(page)

// Configuration
await client.getLocations()
await client.getEggs(nestId)
await client.getNests()
```

### DirectAdmin (✅ Fully Implemented)
Web hosting control panel integration. Supports both API v1 and v2.

- **Status**: Production Ready
- **Features**:
  - Create/delete hosting accounts
  - Suspend/unsuspend accounts
  - Change passwords
  - Manage packages
  - Domain management
  - Database creation
  - List all accounts

**Setup**:
1. Enable API access in DirectAdmin
2. Add to `.env`:
```env
DIRECTADMIN_URL=https://server.com:2222
DIRECTADMIN_USERNAME=admin
DIRECTADMIN_PASSWORD=password
DIRECTADMIN_API_VERSION=v2 # or v1
```

**Available Methods**:
```typescript
const client = new DirectAdminClient()

// Account Management
await client.createAccount(username, email, password, domain, package)
await client.suspendAccount(username)
await client.unsuspendAccount(username)
await client.deleteAccount(username)
await client.changePassword(username, newPassword)
await client.getAccountInfo(username)
await client.listAccounts()

// Configuration
await client.getPackages()
await client.changePackage(username, packageName)
await client.getDomains(username)

// Database Management
await client.createDatabase(username, dbName, dbUser, dbPassword)
```

**API Version Differences**:
- **v2** (Recommended): Uses REST JSON API
- **v1** (Legacy): Uses form-encoded API with CMD_API_* endpoints

### VirtFusion (✅ Fully Implemented)
VPS management platform integration.

- **Status**: Production Ready
- **Features**:
  - Create/terminate VPS servers
  - Suspend/unsuspend servers
  - Start/stop/reboot servers
  - Reinstall with different OS
  - Resize server resources
  - Console access
  - ISO mounting/unmounting
  - Server statistics

**Setup**:
1. Get API token from VirtFusion panel
2. Add to `.env`:
```env
VIRTFUSION_URL=https://panel.example.com
VIRTFUSION_API_KEY=your-api-key
```

**Available Methods**:
```typescript
const client = new VirtfusionClient()

// Server Management
await client.createServer({ package_id, hostname, password, ipv4, ipv6 })
await client.getServer(serverId)
await client.terminateServer(serverId)
await client.suspendServer(serverId)
await client.unsuspendServer(serverId)

// Power Management
await client.startServer(serverId)
await client.stopServer(serverId)
await client.shutdownServer(serverId)
await client.rebootServer(serverId)

// Configuration
await client.reinstallServer(serverId, osId)
await client.resizeServer(serverId, packageId)
await client.changePassword(serverId, password)

// Utilities
await client.listServers()
await client.getPackages()
await client.getServerStats(serverId)
await client.getConsoleUrl(serverId)
await client.mountISO(serverId, isoId)
await client.unmountISO(serverId)
```

## Provisioning Service

The `ProvisioningService` class automatically handles service lifecycle management.

**Features**:
- Automatic provisioning when service is ordered
- Suspend/unsuspend operations
- Service termination with cleanup
- Audit logging for all operations
- Error handling and retry logic

**Usage**:
```typescript
import { ProvisioningService } from '@/lib/services/provisioning'

const provisioning = new ProvisioningService()

// Provision a new service
await provisioning.provisionService(serviceId)

// Suspend a service
await provisioning.suspendService(serviceId)

// Unsuspend a service
await provisioning.unsuspendService(serviceId)

// Terminate a service
await provisioning.terminateService(serviceId)
```

**How It Works**:
1. Checks service and product configuration
2. Determines server type (Pterodactyl, DirectAdmin, VirtFusion)
3. Calls appropriate integration
4. Updates service status in database
5. Creates audit log entry
6. Handles errors and retries

## Testing Integrations

### Test Connection
All integration clients have a `testConnection()` method:

```typescript
const pterodactyl = new PterodactylClient()
const result = await pterodactyl.testConnection()
console.log(result) // { success: true, message: "..." }
```

### Admin Interface
Navigate to `/admin/servers` to:
- Add server configurations
- Test connections
- View server status
- Configure integration settings

## Audit Logging

All payment and provisioning operations are logged to the audit trail:
- Payment received/failed/refunded
- Service provisioned/suspended/unsuspended/terminated
- Includes user info, timestamp, IP address, details

View audit logs at `/admin/audit-logs`

## Error Handling

All integrations include comprehensive error handling:
- API connection errors
- Authentication failures
- Resource not found
- Rate limiting
- Invalid parameters

Errors are:
1. Logged to console with details
2. Stored in provision records
3. Returned with user-friendly messages
4. Tracked with retry counts

## Security Best Practices

1. **Never commit `.env` file** - Use `.env.example` as template
2. **Use environment variables** - Never hardcode credentials
3. **Enable webhook signature verification** - Validate all webhook requests
4. **Use HTTPS** - All API communication should be encrypted
5. **Rotate API keys regularly** - Update credentials periodically
6. **Limit API permissions** - Use least privilege principle
7. **Monitor audit logs** - Review for suspicious activity

## Troubleshooting

### PayPal Issues
- **Sandbox vs Live**: Make sure `PAYPAL_MODE` matches your credentials
- **Webhook not firing**: Check webhook URL is publicly accessible
- **Payment not captured**: Verify return URL is correct

### Pterodactyl Issues
- **Connection failed**: Verify API key has Application API permissions
- **Server creation failed**: Check egg ID, location ID, and allocation availability
- **401 Unauthorized**: API key may be incorrect or expired

### DirectAdmin Issues
- **API v1 vs v2**: Check which version your server supports
- **Authentication failed**: Verify admin username and password
- **Port issues**: Default is 2222, check if custom port is used

### VirtFusion Issues
- **Invalid package**: Ensure package ID exists and is available
- **IP allocation failed**: Check if IPv4/IPv6 addresses are available
- **API rate limit**: VirtFusion may have rate limiting enabled

## Next Steps

1. Configure your integrations in `.env`
2. Test connections from `/admin/servers`
3. Create products linked to servers
4. Configure automatic provisioning
5. Monitor audit logs for issues

## Support

For integration-specific issues, refer to:
- Stripe: https://stripe.com/docs
- PayPal: https://developer.paypal.com/docs
- Pterodactyl: https://pterodactyl.io/panel/1.0/api.html
- DirectAdmin: https://www.directadmin.com/api.php
- VirtFusion: https://virtfusion.com/docs/api

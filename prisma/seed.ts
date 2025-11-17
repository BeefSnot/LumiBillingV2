import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lumisolutions.tech' },
    update: {},
    create: {
      email: 'admin@lumisolutions.tech',
      password: await hash('admin123', 12),
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  })

  console.log('Created admin user:', admin.email)

  // Create test client
  const client = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      email: 'client@example.com',
      password: await hash('client123', 12),
      firstName: 'John',
      lastName: 'Doe',
      company: 'Example Corp',
      role: 'CLIENT',
    },
  })

  console.log('Created test client:', client.email)

  // Create test servers
  const daServer = await prisma.server.create({
    data: {
      name: 'DirectAdmin Server 1',
      hostname: 'da1.lumisolutions.tech',
      ipAddress: '192.168.1.100',
      type: 'DIRECTADMIN',
      apiUrl: 'https://da1.lumisolutions.tech:2222',
      username: 'admin',
      password: 'password',
      maxAccounts: 100,
      active: true,
    },
  })

  const vfServer = await prisma.server.create({
    data: {
      name: 'Virtfusion Server 1',
      hostname: 'vf1.lumisolutions.tech',
      ipAddress: '192.168.1.101',
      type: 'VIRTFUSION',
      apiUrl: 'https://vf1.lumisolutions.tech',
      apiKey: 'your-api-key',
      maxAccounts: 50,
      active: true,
    },
  })

  const ptServer = await prisma.server.create({
    data: {
      name: 'Pterodactyl Server 1',
      hostname: 'pt1.lumisolutions.tech',
      ipAddress: '192.168.1.102',
      type: 'PTERODACTYL',
      apiUrl: 'https://pt1.lumisolutions.tech',
      apiKey: 'your-api-key',
      maxAccounts: 100,
      active: true,
    },
  })

  console.log('Created test servers')

  // Create test products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Shared Hosting - Starter',
        description: 'Perfect for small websites and blogs',
        type: 'HOSTING',
        price: 9.99,
        billingCycle: 'MONTHLY',
        setupFee: 0,
        serverId: daServer.id,
        diskSpace: 10,
        bandwidth: 100,
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'VPS - Standard',
        description: '2 CPU, 4GB RAM, 50GB SSD',
        type: 'VPS',
        price: 19.99,
        billingCycle: 'MONTHLY',
        setupFee: 5,
        serverId: vfServer.id,
        ram: 4,
        cpu: 2,
        diskSpace: 50,
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Game Server - Minecraft',
        description: 'Minecraft server hosting with 4GB RAM',
        type: 'GAME_SERVER',
        price: 14.99,
        billingCycle: 'MONTHLY',
        setupFee: 0,
        serverId: ptServer.id,
        ram: 4,
        cpu: 2,
        diskSpace: 25,
        active: true,
      },
    }),
  ])

  console.log('Created test products:', products.length)

  // Create test service for client
  const service = await prisma.service.create({
    data: {
      userId: client.id,
      productId: products[0].id,
      serverId: daServer.id,
      domain: 'example.com',
      status: 'ACTIVE',
      nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      recurringAmount: products[0].price,
    },
  })

  console.log('Created test service')

  // Create test invoice
  const invoice = await prisma.invoice.upsert({
    where: { invoiceNumber: 'INV-2024-001' },
    update: {},
    create: {
      userId: client.id,
      invoiceNumber: 'INV-2024-001',
      status: 'UNPAID',
      subtotal: 9.99,
      tax: 0,
      total: 9.99,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          {
            description: 'Shared Hosting - Starter (Monthly)',
            amount: 9.99,
            quantity: 1,
          },
        ],
      },
    },
  })

  console.log('Created test invoice')

  // Create test departments
  const departments = await Promise.all([
    prisma.department.create({
      data: {
        name: 'Sales',
        description: 'Pre-sales questions and inquiries',
        email: 'sales@lumisolutions.tech',
        active: true,
      },
    }),
    prisma.department.create({
      data: {
        name: 'Technical Support',
        description: 'Technical assistance and troubleshooting',
        email: 'support@lumisolutions.tech',
        active: true,
      },
    }),
    prisma.department.create({
      data: {
        name: 'Billing',
        description: 'Billing and payment inquiries',
        email: 'billing@lumisolutions.tech',
        active: true,
      },
    }),
  ])

  console.log('Created test departments:', departments.length)

  // Create test ticket
  const ticket = await prisma.ticket.create({
    data: {
      userId: client.id,
      subject: 'Need help setting up email',
      status: 'OPEN',
      priority: 'MEDIUM',
      departmentId: departments[1].id,
      replies: {
        create: [
          {
            userId: client.id,
            message: 'Hi, I need help setting up email accounts for my domain. Can you assist?',
            isStaff: false,
          },
        ],
      },
    },
  })

  console.log('Created test ticket')

  // Create permissions
  const modules = ['clients', 'invoices', 'services', 'products', 'tickets', 'servers', 'reports', 'settings']
  const actions = ['view', 'create', 'edit', 'delete']
  
  const permissionsData = []
  for (const module of modules) {
    for (const action of actions) {
      permissionsData.push({
        module,
        action,
        description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${module}`,
      })
    }
  }

  for (const perm of permissionsData) {
    await prisma.permission.upsert({
      where: {
        module_action: {
          module: perm.module,
          action: perm.action,
        },
      },
      update: {},
      create: perm,
    })
  }

  console.log('Created permissions:', permissionsData.length)

  // Create default roles
  const supportPermissions = await prisma.permission.findMany({
    where: {
      OR: [
        { module: 'tickets' },
        { module: 'clients', action: 'view' },
        { module: 'services', action: 'view' },
      ],
    },
  })

  const supportRole = await prisma.role.upsert({
    where: { name: 'Support Agent' },
    update: {},
    create: {
      name: 'Support Agent',
      description: 'Can view and manage support tickets',
      permissions: JSON.stringify(supportPermissions.map(p => p.id)),
      isActive: true,
    },
  })

  const billingPermissions = await prisma.permission.findMany({
    where: {
      OR: [
        { module: 'invoices' },
        { module: 'clients', action: 'view' },
        { module: 'clients', action: 'edit' },
        { module: 'services', action: 'view' },
      ],
    },
  })

  const billingRole = await prisma.role.upsert({
    where: { name: 'Billing Manager' },
    update: {},
    create: {
      name: 'Billing Manager',
      description: 'Can manage invoices and client billing',
      permissions: JSON.stringify(billingPermissions.map(p => p.id)),
      isActive: true,
    },
  })

  console.log('Created default roles:', [supportRole.name, billingRole.name])

  // Create settings
  const settingsData = [
    { key: 'company_name', value: 'Lumi Solutions' },
    { key: 'company_url', value: 'https://lumisolutions.tech' },
    { key: 'company_email', value: 'info@lumisolutions.tech' },
    { key: 'currency', value: 'USD' },
    { key: 'tax_rate', value: '0' },
  ]

  for (const setting of settingsData) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    })
  }

  console.log('Created settings')

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkUser() {
  const client = await prisma.user.findUnique({
    where: { email: 'client@example.com' }
  })
  
  console.log('Client user from database:')
  console.log('Email:', client?.email)
  console.log('Role:', client?.role)
  console.log('Role type:', typeof client?.role)
  console.log('Full user object:', JSON.stringify(client, null, 2))
  
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@lumisolutions.tech' }
  })
  
  console.log('\nAdmin user from database:')
  console.log('Email:', admin?.email)
  console.log('Role:', admin?.role)
  console.log('Role type:', typeof admin?.role)
  
  await prisma.$disconnect()
}

checkUser().catch(console.error)

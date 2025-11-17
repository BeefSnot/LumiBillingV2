import { PrismaClient } from '@prisma/client'
import { optimizeSQLite } from './db-config'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Apply SQLite optimizations on startup
if (!globalForPrisma.prisma) {
  optimizeSQLite(prisma).catch(console.error)
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

import { PrismaClient } from '@prisma/client'
import { optimizeSQLite } from './db-config'
import { parse as parseUrl } from 'url'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Show a friendly warning if the DATABASE_URL is set to 'localhost'. On many
// Linux systems 'localhost' connects over a Unix socket which can trigger
// different auth methods (peer) than a TCP connection — using 127.0.0.1
// forces a TCP connection and usually resolves Prisma authentication issues.
if (process.env.DATABASE_URL) {
  try {
    const parsed = parseUrl(process.env.DATABASE_URL)
    const host = (parsed.hostname || '').toLowerCase()
    if (host === 'localhost') {
      console.warn(
        `⚠️  Your DATABASE_URL uses 'localhost' (\"${process.env.DATABASE_URL}\"). ` +
          "If you're seeing authentication errors, change the host to '127.0.0.1' " +
          "in the production .env to force a TCP connection (e.g. ")
      )
    }
  } catch (err) {
    // ignore parse failures — this is only a helpful warning
  }
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Apply SQLite optimizations on startup
if (!globalForPrisma.prisma) {
  optimizeSQLite(prisma).catch(console.error)
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

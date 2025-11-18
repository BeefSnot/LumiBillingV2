import { PrismaClient } from '@prisma/client'
import { optimizeSQLite } from './db-config'
import { parse as parseUrl } from 'url'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// On Linux (or any production), prefer using TCP (127.0.0.1) instead of
// Unix socket 'localhost' when connecting to Postgres; socket auth can be
// different and cause password-based authentication to fail. If DATABASE_URL
// contains 'localhost' and we are in production, replace it at runtime with
// 127.0.0.1 so build / prerender steps don't fail because of socket auth.
if (
  process.env.DATABASE_URL &&
  process.env.NODE_ENV === 'production'
) {
  try {
    const parsed = parseUrl(process.env.DATABASE_URL)
    const host = (parsed.hostname || '').toLowerCase()
    if (host === 'localhost') {
      // Coerce to IPv4 loopback to force TCP auth
      const fixed = process.env.DATABASE_URL.replace('@localhost', '@127.0.0.1')
      console.warn(
        `⚠️  DATABASE_URL used 'localhost' — forcing TCP loopback to '127.0.0.1'. ` +
        `Using: ${fixed}`
      )
      process.env.DATABASE_URL = fixed
    }
  } catch (err) {
    // Ignore parse failures — this change is only a runtime convenience
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

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
// Normalize DATABASE_URL, trim surrounding quotes (" or ') and whitespace
if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.trim()
  if ((process.env.DATABASE_URL.startsWith('"') && process.env.DATABASE_URL.endsWith('"')) ||
      (process.env.DATABASE_URL.startsWith("'") && process.env.DATABASE_URL.endsWith("'"))) {
    process.env.DATABASE_URL = process.env.DATABASE_URL.slice(1, -1)
  }
}

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

// Apply SQLite optimizations on startup — only if we're using SQLite.
// In production with Postgres this should not run.
// Apply SQLite optimizations on startup
// Only run these when the datasource is actually SQLite. If you switched
// Prisma to Postgres the optimizations and pragmas are not applicable and
// will error — so detect the DB provider by checking DATABASE_URL.
if (!globalForPrisma.prisma) {
  // Ensure the effective DATABASE_URL does not contain surrounding quotes
  const databaseUrl = (process.env.DATABASE_URL || '').toLowerCase().trim()
  const isSqlite = databaseUrl.startsWith('file:') || databaseUrl.includes('sqlite')
  if (isSqlite) {
    optimizeSQLite(prisma).catch(console.error)
  }
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

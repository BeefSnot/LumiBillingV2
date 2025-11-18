import dotenv from 'dotenv'

// Load .env explicitly so we can inspect value in the environment used by CLI
dotenv.config()

// Safely show only scheme and host — never print secrets in logs
const raw = process.env.DATABASE_URL || ''
function safeDSN(dsn: string) {
  if (!dsn) return '(not set)'
  try {
    // Using URL parser to extract protocol and hostname
    const url = new URL(dsn)
    return `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ''}/${url.pathname.replace(/^\//, '')}`
  } catch (err) {
    return `(invalid: ${JSON.stringify(dsn)})`
  }
}

console.log('DATABASE_URL (safe):', safeDSN(raw))
console.log('raw DATABASE_URL length:', raw.length)
console.log('PRISMA_SCHEMA:', process.env.PRISMA_SCHEMA || '(default)')
console.log('NODE_ENV:', process.env.NODE_ENV || '(not set)')

// Provide exit code for CI
if (!raw) process.exit(2)
process.exit(0)

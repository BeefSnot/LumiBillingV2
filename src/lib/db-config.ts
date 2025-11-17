/**
 * SQLite Performance Configuration
 * Optimizes database for production use
 */

export const SQLITE_PRAGMAS = [
  // Performance optimizations
  'PRAGMA journal_mode = WAL;',           // Write-Ahead Logging (much faster)
  'PRAGMA synchronous = NORMAL;',         // Balance safety and speed
  'PRAGMA cache_size = 10000;',           // 10MB cache (~40MB RAM)
  'PRAGMA temp_store = MEMORY;',          // Use RAM for temp tables
  'PRAGMA mmap_size = 30000000000;',      // Memory-mapped I/O (30GB limit)
  
  // Query optimizations
  'PRAGMA optimize;',                     // Analyze and optimize queries
  
  // Reduce write latency
  'PRAGMA busy_timeout = 5000;',          // Wait 5s if database is locked
  
  // Enable foreign keys
  'PRAGMA foreign_keys = ON;',
]

/**
 * Apply SQLite optimizations to database connection
 */
export async function optimizeSQLite(prisma: any) {
  try {
    for (const pragma of SQLITE_PRAGMAS) {
      await prisma.$executeRawUnsafe(pragma)
    }
    console.log('✅ SQLite optimizations applied')
  } catch (error) {
    console.error('⚠️  Failed to apply SQLite optimizations:', error)
  }
}

/**
 * Database connection best practices:
 * - Use connection pooling (Prisma handles this)
 * - Batch queries when possible
 * - Use indexes for frequently queried fields
 * - Keep transactions short
 * - Vacuum database periodically: PRAGMA vacuum;
 */

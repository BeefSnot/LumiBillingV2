import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import os from 'os'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get system information
    const uptime = os.uptime()
    const totalMemory = os.totalmem()
    const freeMemory = os.freemem()
    const usedMemory = totalMemory - freeMemory
    
    // CPU load average (1 minute)
    const loadAvg = os.loadavg()[0]
    const cpuCount = os.cpus().length
    const cpuPercentage = Math.min((loadAvg / cpuCount) * 100, 100)

    // Test database connection
    let dbStatus = 'healthy'
    let dbResponseTime = 0
    try {
      const start = Date.now()
      await prisma.$queryRaw`SELECT 1`
      dbResponseTime = Date.now() - start
    } catch (error) {
      dbStatus = 'error'
      console.error('Database health check failed:', error)
    }

    // Mock storage info (in production, use actual disk usage libraries)
    const storageUsed = 45 * 1024 * 1024 * 1024 // 45 GB
    const storageTotal = 100 * 1024 * 1024 * 1024 // 100 GB

    return NextResponse.json({
      uptime,
      memory: {
        used: usedMemory,
        total: totalMemory,
      },
      cpu: parseFloat(cpuPercentage.toFixed(2)),
      database: {
        status: dbStatus,
        responseTime: dbResponseTime,
      },
      storage: {
        used: storageUsed,
        total: storageTotal,
      },
    })
  } catch (error) {
    console.error('Error fetching system health:', error)
    return NextResponse.json({ error: 'Failed to fetch system health' }, { status: 500 })
  }
}

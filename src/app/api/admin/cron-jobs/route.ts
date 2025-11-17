import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// In a production system, this would come from a database table
const CRON_JOBS = [
  {
    id: '1',
    name: 'Invoice Generation',
    description: 'Generate recurring invoices for active services',
    schedule: '0 0 * * *',
    lastRun: new Date(Date.now() - 3600000).toISOString(),
    nextRun: new Date(Date.now() + 82800000).toISOString(),
    status: 'ACTIVE',
    runCount: 450,
  },
  {
    id: '2',
    name: 'Payment Reminders',
    description: 'Send overdue invoice reminders to clients',
    schedule: '0 9 * * *',
    lastRun: new Date(Date.now() - 7200000).toISOString(),
    nextRun: new Date(Date.now() + 79200000).toISOString(),
    status: 'ACTIVE',
    runCount: 320,
  },
  {
    id: '3',
    name: 'Service Provisioning',
    description: 'Process pending service provisioning requests',
    schedule: '*/15 * * * *',
    lastRun: new Date(Date.now() - 900000).toISOString(),
    nextRun: new Date(Date.now() + 900000).toISOString(),
    status: 'ACTIVE',
    runCount: 12500,
  },
  {
    id: '4',
    name: 'Service Suspension',
    description: 'Suspend services with overdue invoices',
    schedule: '0 2 * * *',
    lastRun: new Date(Date.now() - 18000000).toISOString(),
    nextRun: new Date(Date.now() + 68400000).toISOString(),
    status: 'ACTIVE',
    runCount: 180,
  },
  {
    id: '5',
    name: 'Database Backup',
    description: 'Create automated database backups',
    schedule: '0 3 * * *',
    lastRun: new Date(Date.now() - 10800000).toISOString(),
    nextRun: new Date(Date.now() + 75600000).toISOString(),
    status: 'ACTIVE',
    runCount: 90,
  },
  {
    id: '6',
    name: 'Audit Log Cleanup',
    description: 'Remove old audit logs (90+ days)',
    schedule: '0 4 * * 0',
    lastRun: new Date(Date.now() - 172800000).toISOString(),
    nextRun: new Date(Date.now() + 432000000).toISOString(),
    status: 'ACTIVE',
    runCount: 12,
  },
]

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ jobs: CRON_JOBS })
  } catch (error) {
    console.error('Error fetching cron jobs:', error)
    return NextResponse.json({ error: 'Failed to fetch cron jobs' }, { status: 500 })
  }
}

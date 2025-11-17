import { prisma } from './prisma'
import { headers } from 'next/headers'

interface AuditLogData {
  userId?: string
  userEmail?: string
  action: string
  entity: string
  entityId?: string
  details?: string
}

export async function createAuditLog(data: AuditLogData) {
  try {
    const headersList = headers()
    const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'

    await prisma.auditLog.create({
      data: {
        ...data,
        ipAddress,
        userAgent,
      },
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
  }
}

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const tickets = await prisma.ticket.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        department: {
          select: { name: true },
        },
        _count: {
          select: { replies: true },
        },
      },
    })

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { subject, departmentId, priority, message } = await request.json()

    const ticket = await prisma.ticket.create({
      data: {
        userId: user.id,
        subject,
        departmentId,
        priority: priority || 'MEDIUM',
        status: 'OPEN',
        replies: {
          create: {
            userId: user.id,
            message,
            isStaff: false,
          },
        },
      },
      include: {
        department: true,
      },
    })

    await createAuditLog({
      userId: user.id,
      userEmail: user.email,
      action: 'CREATE',
      entity: 'TICKET',
      entityId: ticket.id,
      details: `Created ticket: ${subject}`,
    })

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Error creating ticket:', error)
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 })
  }
}

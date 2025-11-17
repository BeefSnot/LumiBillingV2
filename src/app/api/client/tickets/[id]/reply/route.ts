import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const ticket = await prisma.ticket.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    const { message } = await request.json()

    const reply = await prisma.ticketReply.create({
      data: {
        ticketId: params.id,
        userId: user.id,
        message,
        isStaff: false,
      },
    })

    await prisma.ticket.update({
      where: { id: params.id },
      data: {
        status: 'OPEN',
        updatedAt: new Date(),
      },
    })

    await createAuditLog({
      userId: user.id,
      userEmail: user.email,
      action: 'CREATE',
      entity: 'TICKET_REPLY',
      entityId: reply.id,
      details: `Replied to ticket: ${ticket.subject}`,
    })

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Error creating reply:', error)
    return NextResponse.json({ error: 'Failed to create reply' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    console.log('Session:', JSON.stringify(session, null, 2))

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin or staff
    if (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF') {
      return NextResponse.json({ error: 'Forbidden - Admin or staff access required' }, { status: 403 })
    }

    const { ticketId, message } = await request.json()

    console.log('Creating reply for ticket:', ticketId, 'by user:', session.user.id)

    if (!ticketId || !message?.trim()) {
      return NextResponse.json({ error: 'Ticket ID and message are required' }, { status: 400 })
    }

    // Verify ticket exists
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { user: true }
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    console.log('Found user:', user ? `${user.email} (${user.id})` : 'NOT FOUND')

    if (!user) {
      return NextResponse.json({ error: 'User not found. Please log out and log back in.' }, { status: 404 })
    }

    // Create the reply
    const reply = await prisma.ticketReply.create({
      data: {
        ticketId,
        userId: session.user.id,
        message: message.trim(),
        isStaff: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    })

    // Update ticket's updatedAt timestamp
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() }
    })

    // Log the action
    await createAuditLog({
      action: 'REPLY_TICKET',
      entity: 'TICKET',
      entityId: ticketId,
      userId: session.user.id,
      userEmail: session.user.email,
      details: JSON.stringify({ 
        ticketSubject: ticket.subject,
        replyLength: message.length,
        clientEmail: ticket.user.email
      })
    })

    return NextResponse.json({
      success: true,
      reply
    })
  } catch (error) {
    console.error('Error creating ticket reply:', error)
    return NextResponse.json(
      { error: 'Failed to create ticket reply' },
      { status: 500 }
    )
  }
}

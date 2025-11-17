import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendInvoiceEmail } from '@/lib/email'

// Get all invoices
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        invoiceNumber: true,
        total: true,
        status: true,
        dueDate: true,
        createdAt: true,
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    })

    return NextResponse.json({ invoices })
  } catch (error) {
    console.error('Invoices fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}

// Create invoice
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, items, dueDate, sendEmail } = await req.json()

    if (!userId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + item.amount, 0)
    const tax = subtotal * 0.1 // 10% tax, make this configurable
    const total = subtotal + tax

    // Generate invoice number
    const count = await prisma.invoice.count()
    const invoiceNumber = `INV-${String(count + 1).padStart(5, '0')}`

    // Create invoice with items
    const invoice = await prisma.invoice.create({
      data: {
        userId,
        invoiceNumber,
        subtotal,
        tax,
        total,
        status: 'UNPAID',
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            amount: item.amount,
          }))
        }
      },
      include: {
        user: true,
        items: true,
      }
    })

    // Send email if requested
    if (sendEmail) {
      await sendInvoiceEmail(
        invoice.user.email,
        invoice.invoiceNumber,
        invoice.total,
        invoice.dueDate
      )
    }

    return NextResponse.json({ success: true, invoice })
  } catch (error) {
    console.error('Invoice creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}

// Update invoice status
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { invoiceId, status } = await req.json()

    if (!invoiceId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const invoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status,
        paidDate: status === 'PAID' ? new Date() : null,
      }
    })

    // Create transaction if marking as paid
    if (status === 'PAID') {
      await prisma.transaction.create({
        data: {
          userId: invoice.userId,
          invoiceId: invoice.id,
          amount: invoice.total,
          gateway: 'MANUAL',
          description: `Manual payment for invoice ${invoice.invoiceNumber}`,
        }
      })
    }

    return NextResponse.json({ success: true, invoice })
  } catch (error) {
    console.error('Invoice update error:', error)
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    )
  }
}

// Delete invoice
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const invoiceId = searchParams.get('invoiceId')

    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 })
    }

    // Delete invoice items first
    await prisma.invoiceItem.deleteMany({
      where: { invoiceId }
    })

    // Delete the invoice
    await prisma.invoice.delete({
      where: { id: invoiceId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Invoice deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 })
  }
}

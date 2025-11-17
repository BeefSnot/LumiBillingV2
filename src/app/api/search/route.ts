import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') || ''

    if (query.length < 2) {
      return NextResponse.json({ results: [] })
    }

    const results: any[] = []

    // Admin can search everything
    if (user.role === 'ADMIN') {
      // Search clients
      const clients = await prisma.user.findMany({
        where: {
          OR: [
            { email: { contains: query } },
            { firstName: { contains: query } },
            { lastName: { contains: query } },
            { company: { contains: query } },
          ],
          role: 'CLIENT'
        },
        take: 5,
      })

      results.push(...clients.map(client => ({
        type: 'client',
        id: client.id,
        title: `${client.firstName} ${client.lastName}`,
        subtitle: client.email,
        url: `/admin/clients`,
      })))

      // Search invoices
      const invoices = await prisma.invoice.findMany({
        where: {
          invoiceNumber: { contains: query }
        },
        include: { user: true },
        take: 5,
      })

      results.push(...invoices.map(invoice => ({
        type: 'invoice',
        id: invoice.id,
        title: `Invoice ${invoice.invoiceNumber}`,
        subtitle: `${invoice.user.firstName} ${invoice.user.lastName} - $${invoice.total}`,
        url: `/admin/invoices`,
      })))

      // Search services
      const services = await prisma.service.findMany({
        where: {
          OR: [
            { domain: { contains: query } },
            { username: { contains: query } },
          ]
        },
        include: { user: true, product: true },
        take: 5,
      })

      results.push(...services.map(service => ({
        type: 'service',
        id: service.id,
        title: service.domain || service.username || 'Service',
        subtitle: `${service.user.email} - ${service.product.name}`,
        url: `/admin/services`,
      })))

      // Search products
      const products = await prisma.product.findMany({
        where: {
          name: { contains: query }
        },
        take: 5,
      })

      results.push(...products.map(product => ({
        type: 'product',
        id: product.id,
        title: product.name,
        subtitle: `$${product.price}/${product.billingCycle}`,
        url: `/admin/products`,
      })))

      // Search tickets
      const tickets = await prisma.ticket.findMany({
        where: {
          subject: { contains: query }
        },
        include: { user: true },
        take: 5,
      })

      results.push(...tickets.map(ticket => ({
        type: 'ticket',
        id: ticket.id,
        title: ticket.subject,
        subtitle: `${ticket.user.email} - ${ticket.status}`,
        url: `/admin/tickets`,
      })))
    } else {
      // Clients can only search their own data
      const invoices = await prisma.invoice.findMany({
        where: {
          userId: user.id,
          invoiceNumber: { contains: query }
        },
        take: 5,
      })

      results.push(...invoices.map(invoice => ({
        type: 'invoice',
        id: invoice.id,
        title: `Invoice ${invoice.invoiceNumber}`,
        subtitle: `$${invoice.total} - ${invoice.status}`,
        url: `/client/invoices`,
      })))

      const services = await prisma.service.findMany({
        where: {
          userId: user.id,
          OR: [
            { domain: { contains: query } },
            { username: { contains: query } },
          ]
        },
        include: { product: true },
        take: 5,
      })

      results.push(...services.map(service => ({
        type: 'service',
        id: service.id,
        title: service.domain || service.username || 'Service',
        subtitle: `${service.product.name} - ${service.status}`,
        url: `/client/services`,
      })))

      const tickets = await prisma.ticket.findMany({
        where: {
          userId: user.id,
          subject: { contains: query }
        },
        take: 5,
      })

      results.push(...tickets.map(ticket => ({
        type: 'ticket',
        id: ticket.id,
        title: ticket.subject,
        subtitle: ticket.status,
        url: `/client/tickets`,
      })))
    }

    return NextResponse.json({ results: results.slice(0, 10) })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}

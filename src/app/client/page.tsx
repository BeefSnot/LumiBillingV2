import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'

export const revalidate = 30 // Revalidate every 30 seconds

async function getClientData(userId: string) {
  const [services, invoices, tickets] = await Promise.all([
    prisma.service.findMany({
      where: { userId },
      select: {
        id: true,
        status: true,
        domain: true,
        recurringAmount: true,
        nextDueDate: true,
        product: {
          select: {
            name: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.invoice.findMany({
      where: { userId },
      select: {
        id: true,
        invoiceNumber: true,
        total: true,
        status: true,
        dueDate: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.ticket.findMany({
      where: { userId },
      select: {
        id: true,
        subject: true,
        status: true,
        priority: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  const activeServices = services.filter(s => s.status === 'ACTIVE').length
  const unpaidInvoices = invoices.filter(i => i.status === 'UNPAID').length
  const openTickets = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length

  return {
    services,
    invoices,
    tickets,
    activeServices,
    unpaidInvoices,
    openTickets,
  }
}

export default async function ClientDashboard() {
  const session = await getServerSession(authOptions)
  const data = await getClientData(session!.user.id)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {session!.user.name}!</h1>
        <p className="mt-2 text-sm text-gray-600">
          Here's an overview of your account
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeServices}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.unpaidInvoices}</div>
            <p className="text-xs text-muted-foreground">Requires payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.openTickets}</div>
            <p className="text-xs text-muted-foreground">Support requests</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>My Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.services.length === 0 ? (
                <p className="text-sm text-gray-500">No services yet</p>
              ) : (
                data.services.map((service) => (
                  <div key={service.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium">{service.product.name}</p>
                      <p className="text-sm text-gray-500">{service.domain || 'No domain'}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      service.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                      service.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 
                      service.status === 'SUSPENDED' ? 'bg-red-100 text-red-700' : 
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {service.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.invoices.length === 0 ? (
                <p className="text-sm text-gray-500">No invoices yet</p>
              ) : (
                data.invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-gray-500">Due {formatDate(invoice.dueDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(invoice.total)}</p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        invoice.status === 'PAID' ? 'bg-green-100 text-green-700' : 
                        invoice.status === 'UNPAID' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

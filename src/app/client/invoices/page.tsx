import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/lib/utils'

export const revalidate = 30 // Revalidate every 30 seconds

async function getInvoices(userId: string) {
  return prisma.invoice.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      invoiceNumber: true,
      total: true,
      status: true,
      dueDate: true,
      createdAt: true,
    }
  })
}

export default async function ClientInvoicesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const invoices = await getInvoices(session.user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <p className="mt-2 text-sm text-gray-600">
          View and manage your invoices
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Invoices ({invoices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell className="text-sm">
                    {formatDate(invoice.createdAt)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(invoice.dueDate)}
                  </TableCell>
                  <TableCell className="font-medium">
                    ${invoice.total.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {invoice.status === 'PAID' && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                        Paid
                      </span>
                    )}
                    {invoice.status === 'UNPAID' && (
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">
                        Unpaid
                      </span>
                    )}
                    {invoice.status === 'OVERDUE' && (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                        Overdue
                      </span>
                    )}
                    {invoice.status === 'CANCELLED' && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        Cancelled
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {invoice.status === 'UNPAID' || invoice.status === 'OVERDUE' ? (
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Pay Now
                      </button>
                    ) : (
                      <button className="text-sm text-gray-600 hover:text-gray-700">
                        View
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {invoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No invoices found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

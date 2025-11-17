import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/lib/utils'

export const revalidate = 30 // Revalidate every 30 seconds

async function getServices(userId: string) {
  return prisma.service.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      product: {
        select: {
          name: true,
          type: true,
        }
      },
    }
  })
}

export default async function ClientServicesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const services = await getServices(session.user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Services</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your active services
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Services ({services.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Next Due</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <div className="font-medium">{service.product.name}</div>
                    <div className="text-xs text-gray-500 capitalize">
                      {service.product.type.toLowerCase()}
                    </div>
                  </TableCell>
                  <TableCell>{service.domain || '-'}</TableCell>
                  <TableCell>
                    {service.status === 'ACTIVE' && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                        Active
                      </span>
                    )}
                    {service.status === 'PENDING' && (
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">
                        Pending
                      </span>
                    )}
                    {service.status === 'SUSPENDED' && (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                        Suspended
                      </span>
                    )}
                    {service.status === 'TERMINATED' && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        Terminated
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {service.username || '-'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(service.nextDueDate)}
                  </TableCell>
                  <TableCell className="font-medium">
                    ${service.recurringAmount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              {services.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    You don't have any services yet.
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

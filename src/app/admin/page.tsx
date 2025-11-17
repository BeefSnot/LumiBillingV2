import AdminDashboard from '@/components/AdminDashboard'
import { prisma } from '@/lib/prisma'

export const revalidate = 30 // Revalidate every 30 seconds

async function getDashboardStats() {
  const [
    totalClients,
    activeServices,
    pendingInvoices,
    monthlyRevenue,
    recentInvoices,
    recentServices,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'CLIENT' } }),
    prisma.service.count({ where: { status: 'ACTIVE' } }),
    prisma.invoice.count({ where: { status: 'UNPAID' } }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    prisma.invoice.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        invoiceNumber: true,
        total: true,
        status: true,
        user: {
          select: {
            email: true,
          }
        }
      }
    }),
    prisma.service.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        user: {
          select: {
            email: true,
          }
        },
        product: {
          select: {
            name: true,
          }
        }
      }
    }),
  ])

  return {
    totalClients,
    activeServices,
    pendingInvoices,
    monthlyRevenue: monthlyRevenue._sum.amount || 0,
    recentInvoices,
    recentServices,
  }
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()
  return <AdminDashboard stats={stats} />
}

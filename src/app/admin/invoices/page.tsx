'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

interface Invoice {
  id: string
  invoiceNumber: string
  total: number
  status: string
  dueDate: Date
  createdAt: Date
  user: {
    email: string
    firstName: string
    lastName: string
  }
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/admin/invoices')
      const data = await res.json()
      setInvoices(data.invoices || [])
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/invoices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: id, status: newStatus }),
      })

      if (res.ok) {
        fetchInvoices()
      } else {
        alert('Failed to update invoice status')
      }
    } catch (error) {
      console.error('Failed to update invoice:', error)
      alert('Failed to update invoice status')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) {
      return
    }

    try {
      const res = await fetch(`/api/admin/invoices?invoiceId=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchInvoices()
      } else {
        alert('Failed to delete invoice')
      }
    } catch (error) {
      console.error('Failed to delete invoice:', error)
      alert('Failed to delete invoice')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading invoices...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage billing and invoices
          </p>
        </div>
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
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">
                      {invoice.user.firstName} {invoice.user.lastName}
                    </div>
                    <div className="text-xs text-gray-500">{invoice.user.email}</div>
                  </TableCell>
                  <TableCell className="font-medium">${invoice.total.toFixed(2)}</TableCell>
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
                  <TableCell className="text-sm">{formatDate(invoice.dueDate)}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(invoice.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <select
                        value={invoice.status}
                        onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="PAID">Paid</option>
                        <option value="UNPAID">Unpaid</option>
                        <option value="OVERDUE">Overdue</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(invoice.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {invoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
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

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import CreateClientModal from '@/components/CreateClientModal'
import CreateInvoiceModal from '@/components/CreateInvoiceModal'
import EditClientModal from '@/components/EditClientModal'

interface Client {
  id: string
  email: string
  firstName: string
  lastName: string
  company: string | null
  emailVerified: Date | null
  createdAt: string
  _count: {
    services: number
    invoices: number
    tickets: number
  }
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/admin/clients')
      const data = await response.json()
      setClients(data.clients || [])
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  const handleDelete = async (clientId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete ${email}? This cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/clients?userId=${clientId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchClients()
      } else {
        alert('Failed to delete client')
      }
    } catch (error) {
      alert('Error deleting client')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage customer accounts
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowInvoiceModal(true)}>
            Create Invoice
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            Create Client
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Clients ({clients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Services</TableHead>
                <TableHead>Invoices</TableHead>
                <TableHead>Tickets</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    {client.firstName} {client.lastName}
                  </TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.company || '-'}</TableCell>
                  <TableCell>{client._count.services}</TableCell>
                  <TableCell>{client._count.invoices}</TableCell>
                  <TableCell>{client._count.tickets}</TableCell>
                  <TableCell>
                    {client.emailVerified ? (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                        Verified
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">
                        Pending
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingClient(client)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(client.id, client.email)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {clients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No clients found. Create your first client to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showCreateModal && (
        <CreateClientModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchClients()
            setShowCreateModal(false)
          }}
        />
      )}

      {showInvoiceModal && (
        <CreateInvoiceModal
          clients={clients}
          onClose={() => setShowInvoiceModal(false)}
          onSuccess={() => {
            setShowInvoiceModal(false)
          }}
        />
      )}

      {editingClient && (
        <EditClientModal
          client={editingClient}
          onClose={() => setEditingClient(null)}
          onSuccess={() => {
            fetchClients()
            setEditingClient(null)
          }}
        />
      )}
    </div>
  )
}

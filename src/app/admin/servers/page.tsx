'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import CreateServerModal from '@/components/CreateServerModal'
import EditServerModal from '@/components/EditServerModal'

interface Server {
  id: string
  name: string
  hostname: string
  ipAddress: string
  type: string
  apiUrl: string
  username: string | null
  password: string | null
  apiKey: string | null
  apiVersion: string | null
  maxAccounts: number | null
  active: boolean
  _count: {
    products: number
  }
}

export default function AdminServersPage() {
  const [servers, setServers] = useState<Server[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingServer, setEditingServer] = useState<Server | null>(null)

  const fetchServers = async () => {
    try {
      const res = await fetch('/api/admin/servers')
      const data = await res.json()
      setServers(data.servers || [])
    } catch (error) {
      console.error('Failed to fetch servers:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServers()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this server? This action cannot be undone.')) {
      return
    }

    try {
      const res = await fetch(`/api/admin/servers?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchServers()
      } else {
        alert('Failed to delete server')
      }
    } catch (error) {
      console.error('Failed to delete server:', error)
      alert('Failed to delete server')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading servers...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Servers</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage server infrastructure
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          Create Server
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Servers ({servers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Hostname</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {servers.map((server) => (
                <TableRow key={server.id}>
                  <TableCell className="font-medium">{server.name}</TableCell>
                  <TableCell className="capitalize">
                    {server.type.toLowerCase()}
                  </TableCell>
                  <TableCell className="text-sm">{server.hostname}</TableCell>
                  <TableCell className="text-sm font-mono">{server.ipAddress}</TableCell>
                  <TableCell>{server._count.products}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {server.maxAccounts ? (
                        <>
                          <span className="font-medium">0</span> / {server.maxAccounts}
                        </>
                      ) : (
                        <span className="text-gray-500">Unlimited</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {server.active ? (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        Inactive
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingServer(server)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(server.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {servers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No servers found. Create your first server to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showCreateModal && (
        <CreateServerModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchServers()
            setShowCreateModal(false)
          }}
        />
      )}

      {editingServer && (
        <EditServerModal
          server={editingServer}
          onClose={() => setEditingServer(null)}
          onSuccess={() => {
            fetchServers()
            setEditingServer(null)
          }}
        />
      )}
    </div>
  )
}

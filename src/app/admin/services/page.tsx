'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

interface Service {
  id: string
  domain: string | null
  status: string
  nextDueDate: Date
  createdAt: Date
  user: {
    email: string
    firstName: string
    lastName: string
  }
  product: {
    name: string
    type: string
  }
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/admin/services')
      const data = await res.json()
      setServices(data.services || [])
    } catch (error) {
      console.error('Failed to fetch services:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })

      if (res.ok) {
        fetchServices()
      } else {
        alert('Failed to update service status')
      }
    } catch (error) {
      console.error('Failed to update service:', error)
      alert('Failed to update service status')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading services...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage active services and provisioning
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Services ({services.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Next Due</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <div className="text-sm font-medium">
                      {service.user.firstName} {service.user.lastName}
                    </div>
                    <div className="text-xs text-gray-500">{service.user.email}</div>
                  </TableCell>
                  <TableCell className="font-medium">{service.product.name}</TableCell>
                  <TableCell className="capitalize">
                    {service.product.type.toLowerCase()}
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
                  <TableCell className="text-sm">{formatDate(service.nextDueDate)}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(service.createdAt)}
                  </TableCell>
                  <TableCell>
                    <select
                      value={service.status}
                      onChange={(e) => handleStatusChange(service.id, e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="PENDING">Pending</option>
                      <option value="SUSPENDED">Suspended</option>
                      <option value="TERMINATED">Terminated</option>
                    </select>
                  </TableCell>
                </TableRow>
              ))}
              {services.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No services found
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

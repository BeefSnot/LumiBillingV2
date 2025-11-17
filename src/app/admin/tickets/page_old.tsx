'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

interface Ticket {
  id: string
  subject: string
  status: string
  priority: string
  updatedAt: Date
  user: {
    email: string
    firstName: string
    lastName: string
  }
  department: {
    name: string
  }
  _count: {
    replies: number
  }
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/admin/tickets')
      const data = await res.json()
      setTickets(data.tickets || [])
    } catch (error) {
      console.error('Failed to fetch tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/tickets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })

      if (res.ok) {
        fetchTickets()
      } else {
        alert('Failed to update ticket status')
      }
    } catch (error) {
      console.error('Failed to update ticket:', error)
      alert('Failed to update ticket status')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading tickets...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage customer support requests
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tickets ({tickets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Replies</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium max-w-xs truncate">
                    {ticket.subject}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">
                      {ticket.user.firstName} {ticket.user.lastName}
                    </div>
                    <div className="text-xs text-gray-500">{ticket.user.email}</div>
                  </TableCell>
                  <TableCell>{ticket.department.name}</TableCell>
                  <TableCell>
                    {ticket.priority === 'LOW' && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        Low
                      </span>
                    )}
                    {ticket.priority === 'MEDIUM' && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                        Medium
                      </span>
                    )}
                    {ticket.priority === 'HIGH' && (
                      <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded">
                        High
                      </span>
                    )}
                    {ticket.priority === 'URGENT' && (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                        Urgent
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {ticket.status === 'OPEN' && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                        Open
                      </span>
                    )}
                    {ticket.status === 'IN_PROGRESS' && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                        In Progress
                      </span>
                    )}
                    {ticket.status === 'WAITING' && (
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">
                        Waiting
                      </span>
                    )}
                    {ticket.status === 'CLOSED' && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        Closed
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{ticket._count.replies}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(ticket.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <select
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="WAITING">Waiting</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </TableCell>
                </TableRow>
              ))}
              {tickets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No tickets found
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

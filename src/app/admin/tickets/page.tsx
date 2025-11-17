'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface TicketReply {
  id: string
  message: string
  isStaff: boolean
  createdAt: string
  user: {
    firstName: string
    lastName: string
    email: string
  }
}

interface Ticket {
  id: string
  subject: string
  status: string
  priority: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    company: string | null
  }
  department: {
    id: string
    name: string
  } | null
  replies: TicketReply[]
}

export default function AdminTicketsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const ticketId = searchParams.get('id')
  
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [replyMessage, setReplyMessage] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchTickets()
  }, [])

  useEffect(() => {
    if (ticketId && tickets.length > 0) {
      const ticket = tickets.find(t => t.id === ticketId)
      if (ticket) {
        setSelectedTicket(ticket)
      }
    }
  }, [ticketId, tickets])

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

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/tickets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })

      if (res.ok) {
        fetchTickets()
        if (selectedTicket?.id === id) {
          setSelectedTicket({ ...selectedTicket, status: newStatus })
        }
      }
    } catch (error) {
      console.error('Failed to update ticket:', error)
    }
  }

  const handlePriorityChange = async (id: string, newPriority: string) => {
    try {
      const res = await fetch('/api/admin/tickets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, priority: newPriority }),
      })

      if (res.ok) {
        fetchTickets()
        if (selectedTicket?.id === id) {
          setSelectedTicket({ ...selectedTicket, priority: newPriority })
        }
      }
    } catch (error) {
      console.error('Failed to update ticket:', error)
    }
  }

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTicket || !replyMessage.trim()) return

    setSendingReply(true)
    try {
      const res = await fetch('/api/admin/tickets/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          message: replyMessage,
        }),
      })

      if (res.ok) {
        setReplyMessage('')
        fetchTickets()
        // Refresh selected ticket
        const updated = await fetch(`/api/admin/tickets?id=${selectedTicket.id}`)
        const data = await updated.json()
        if (data.ticket) {
          setSelectedTicket(data.ticket)
        }
      }
    } catch (error) {
      console.error('Failed to send reply:', error)
      alert('Failed to send reply')
    } finally {
      setSendingReply(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'WAITING_CUSTOMER': return 'bg-yellow-100 text-yellow-800'
      case 'RESOLVED': return 'bg-purple-100 text-purple-800'
      case 'CLOSED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-gray-100 text-gray-700'
      case 'MEDIUM': return 'bg-blue-100 text-blue-700'
      case 'HIGH': return 'bg-orange-100 text-orange-700'
      case 'URGENT': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredTickets = filter === 'all' ? tickets : tickets.filter(t => t.status === filter)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
        <p className="mt-2 text-gray-600">View and respond to customer support requests</p>
      </div>

      <div className="flex h-[calc(100vh-250px)] gap-6">
        {/* Tickets List */}
        <div className="w-1/3 bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All', count: tickets.length },
                { value: 'OPEN', label: 'Open', count: tickets.filter(t => t.status === 'OPEN').length },
                { value: 'IN_PROGRESS', label: 'In Progress', count: tickets.filter(t => t.status === 'IN_PROGRESS').length },
                { value: 'WAITING_CUSTOMER', label: 'Waiting', count: tickets.filter(t => t.status === 'WAITING_CUSTOMER').length },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition whitespace-nowrap ${
                    filter === tab.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No tickets found
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredTickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => {
                      setSelectedTicket(ticket)
                      router.push(`/admin/tickets?id=${ticket.id}`, { scroll: false })
                    }}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition ${
                      selectedTicket?.id === ticket.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
                        {ticket.subject}
                      </h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {ticket.user.firstName} {ticket.user.lastName}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(ticket.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ticket Details */}
        <div className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col">
          {selectedTicket ? (
            <>
              {/* Ticket Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedTicket.subject}</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold">
                          {selectedTicket.user.firstName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {selectedTicket.user.firstName} {selectedTicket.user.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{selectedTicket.user.email}</p>
                        </div>
                      </div>
                      {selectedTicket.user.company && (
                        <span className="text-gray-500">• {selectedTicket.user.company}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTicket(null)
                      router.push('/admin/tickets', { scroll: false })
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Status and Priority Controls */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Status</label>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="WAITING_CUSTOMER">Waiting on Customer</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Priority</label>
                    <select
                      value={selectedTicket.priority}
                      onChange={(e) => handlePriorityChange(selectedTicket.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Department</label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700">
                      {selectedTicket.department?.name || 'General'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Replies */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {selectedTicket.replies.map((reply) => (
                  <div
                    key={reply.id}
                    className={`flex gap-3 ${reply.isStaff ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold flex-shrink-0 ${
                      reply.isStaff 
                        ? 'bg-gradient-to-br from-purple-500 to-purple-600' 
                        : 'bg-gradient-to-br from-blue-500 to-blue-600'
                    }`}>
                      {reply.user.firstName.charAt(0)}
                    </div>
                    <div className={`flex-1 ${reply.isStaff ? 'text-right' : ''}`}>
                      <div className={`inline-block max-w-[80%] ${reply.isStaff ? 'text-right' : ''}`}>
                        <div className={`flex items-center gap-2 mb-1 ${reply.isStaff ? 'flex-row-reverse' : ''}`}>
                          <span className="text-sm font-semibold text-gray-900">
                            {reply.user.firstName} {reply.user.lastName}
                          </span>
                          {reply.isStaff && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                              Staff
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            {new Date(reply.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className={`p-4 rounded-2xl text-left ${
                          reply.isStaff
                            ? 'bg-gradient-to-br from-purple-50 to-purple-100 text-gray-900'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              <div className="p-6 border-t border-gray-200">
                <form onSubmit={handleSendReply} className="space-y-3">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    required
                  />
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      disabled={sendingReply || !replyMessage.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition shadow-lg"
                    >
                      {sendingReply ? 'Sending...' : 'Send Reply'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleStatusChange(selectedTicket.id, 'WAITING_CUSTOMER')
                      }}
                      className="px-6 py-3 bg-yellow-500 text-white rounded-xl font-semibold hover:bg-yellow-600 transition"
                    >
                      Mark Waiting
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleStatusChange(selectedTicket.id, 'RESOLVED')
                      }}
                      className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition"
                    >
                      Mark Resolved
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p className="text-lg font-medium">Select a ticket to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

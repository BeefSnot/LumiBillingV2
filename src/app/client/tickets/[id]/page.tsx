'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Reply {
  id: string
  message: string
  isStaff: boolean
  userId: string
  createdAt: string
}

interface Ticket {
  id: string
  subject: string
  status: string
  priority: string
  createdAt: string
  department: {
    name: string
  }
  replies: Reply[]
}

export default function TicketViewPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [replyMessage, setReplyMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchTicket()
  }, [params.id])

  const fetchTicket = async () => {
    try {
      const response = await fetch(`/api/client/tickets/${params.id}`)
      const data = await response.json()
      setTicket(data.ticket)
    } catch (error) {
      console.error('Failed to fetch ticket:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyMessage.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/client/tickets/${params.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyMessage }),
      })

      if (response.ok) {
        setReplyMessage('')
        fetchTicket()
      }
    } catch (error) {
      console.error('Failed to send reply:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading ticket...</div>
  }

  if (!ticket) {
    return <div className="text-center py-12">Ticket not found</div>
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push('/client/tickets')}
        className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Tickets
      </button>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{ticket.subject}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Department: {ticket.department?.name} • Created {new Date(ticket.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 text-xs font-medium rounded ${
              ticket.status === 'OPEN' ? 'bg-green-100 text-green-700' :
              ticket.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
              ticket.status === 'WAITING_CUSTOMER' ? 'bg-yellow-100 text-yellow-700' :
              ticket.status === 'RESOLVED' ? 'bg-purple-100 text-purple-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {ticket.status.replace('_', ' ')}
            </span>
            <span className={`px-3 py-1 text-xs font-medium rounded ${
              ticket.priority === 'LOW' ? 'bg-gray-100 text-gray-700' :
              ticket.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-700' :
              ticket.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
              'bg-red-100 text-red-700'
            }`}>
              {ticket.priority}
            </span>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {ticket.replies.map((reply) => (
            <div
              key={reply.id}
              className={`rounded-xl p-6 ${
                reply.isStaff
                  ? 'bg-blue-50 border border-blue-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {reply.isStaff ? (
                    <>
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="font-semibold text-blue-900">Support Staff</span>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-white">
                          {session?.user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-semibold text-gray-900">You</span>
                    </>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(reply.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{reply.message}</p>
            </div>
          ))}
        </div>

        {ticket.status !== 'CLOSED' && (
          <form onSubmit={handleReply} className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Reply</h3>
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              rows={4}
              placeholder="Type your message here..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              required
            />
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-lg disabled:opacity-50"
              >
                {submitting ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </form>
        )}

        {ticket.status === 'CLOSED' && (
          <div className="border-t border-gray-200 pt-6 text-center">
            <p className="text-gray-500">This ticket is closed. Please open a new ticket if you need further assistance.</p>
          </div>
        )}
      </div>
    </div>
  )
}

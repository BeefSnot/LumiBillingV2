'use client'

import { useState, useEffect } from 'react'

interface AuditLog {
  id: string
  userId: string | null
  userEmail: string | null
  action: string
  entity: string
  entityId: string | null
  details: string | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [filters, setFilters] = useState({
    action: '',
    entity: '',
    userEmail: '',
    dateFrom: '',
    dateTo: '',
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalLogs, setTotalLogs] = useState(0)
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([])

  useEffect(() => {
    fetchLogs()
  }, [page, filters])

  useEffect(() => {
    // Client-side search filtering
    if (searchQuery.trim() === '') {
      setFilteredLogs(logs)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = logs.filter(log => 
        log.userEmail?.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        log.entity.toLowerCase().includes(query) ||
        log.entityId?.toLowerCase().includes(query) ||
        log.details?.toLowerCase().includes(query) ||
        log.ipAddress?.toLowerCase().includes(query)
      )
      setFilteredLogs(filtered)
    }
  }, [logs, searchQuery])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)),
      })

      const response = await fetch(`/api/admin/audit-logs?${params}`)
      const data = await response.json()
      setLogs(data.logs || [])
      setTotalPages(data.totalPages || 1)
      setTotalLogs(data.total || 0)
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = () => {
    setPage(1)
    fetchLogs()
  }

  const handleClearFilters = () => {
    setFilters({
      action: '',
      entity: '',
      userEmail: '',
      dateFrom: '',
      dateTo: '',
    })
    setPage(1)
  }

  const exportLogs = () => {
    const logsToExport = searchQuery ? filteredLogs : logs
    const csv = [
      ['Timestamp', 'User', 'Action', 'Entity', 'Entity ID', 'Details', 'IP Address', 'User Agent'].join(','),
      ...logsToExport.map(log => [
        new Date(log.createdAt).toLocaleString(),
        log.userEmail || 'System',
        log.action,
        log.entity,
        log.entityId || '',
        `"${(log.details || '').replace(/"/g, '""')}"`,
        log.ipAddress || '',
        `"${(log.userAgent || '').replace(/"/g, '""')}"`,
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${searchQuery ? 'filtered-' : ''}${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const printLogs = () => {
    const logsToExport = searchQuery ? filteredLogs : logs
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Audit Logs Report - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #1e40af; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
            .metadata { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .metadata p { margin: 5px 0; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th { background: #3b82f6; color: white; padding: 12px 8px; text-align: left; font-weight: bold; }
            td { padding: 10px 8px; border-bottom: 1px solid #e5e7eb; }
            tr:hover { background: #f9fafb; }
            .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; }
            .badge-create { background: #d1fae5; color: #065f46; }
            .badge-update { background: #dbeafe; color: #1e40af; }
            .badge-delete { background: #fee2e2; color: #991b1b; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>📋 Audit Logs Report</h1>
          <div class="metadata">
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Total Records:</strong> ${logsToExport.length}</p>
            ${searchQuery ? `<p><strong>Search Filter:</strong> "${searchQuery}"</p>` : ''}
            ${filters.action ? `<p><strong>Action Filter:</strong> ${filters.action}</p>` : ''}
            ${filters.entity ? `<p><strong>Entity Filter:</strong> ${filters.entity}</p>` : ''}
            ${filters.userEmail ? `<p><strong>User Filter:</strong> ${filters.userEmail}</p>` : ''}
          </div>
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Entity ID</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              ${logsToExport.map(log => `
                <tr>
                  <td>${new Date(log.createdAt).toLocaleString()}</td>
                  <td>${log.userEmail || 'System'}</td>
                  <td><span class="badge badge-${log.action.toLowerCase()}">${log.action}</span></td>
                  <td>${log.entity}</td>
                  <td>${log.entityId ? log.entityId.slice(0, 12) + '...' : 'N/A'}</td>
                  <td>${log.ipAddress || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
            <p>Lumi Billing Panel - Audit Logs Report</p>
            <p>This is a confidential document. Unauthorized distribution is prohibited.</p>
          </div>
        </body>
      </html>
    `
    
    printWindow.document.write(html)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  const saveFilteredLogs = async () => {
    const logsToSave = searchQuery ? filteredLogs : logs
    
    // Create JSON export with full details
    const jsonExport = {
      exportDate: new Date().toISOString(),
      totalRecords: logsToSave.length,
      filters: {
        searchQuery,
        action: filters.action,
        entity: filters.entity,
        userEmail: filters.userEmail,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      },
      logs: logsToSave.map(log => ({
        ...log,
        details: parseDetails(log.details),
      })),
    }

    const blob = new Blob([JSON.stringify(jsonExport, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-complete-${searchQuery ? 'filtered-' : ''}${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getActionBadge = (action: string) => {
    const badges: Record<string, { emoji: string; color: string }> = {
      CREATE: { emoji: '✨', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
      UPDATE: { emoji: '✏️', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      DELETE: { emoji: '🗑️', color: 'bg-red-100 text-red-800 border-red-200' },
      LOGIN: { emoji: '🔓', color: 'bg-purple-100 text-purple-800 border-purple-200' },
      LOGOUT: { emoji: '🔒', color: 'bg-gray-100 text-gray-800 border-gray-200' },
      PAYMENT: { emoji: '💳', color: 'bg-green-100 text-green-800 border-green-200' },
      REPLY_TICKET: { emoji: '💬', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    }
    const badge = badges[action] || { emoji: '📝', color: 'bg-gray-100 text-gray-800 border-gray-200' }
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold border ${badge.color}`}>
        <span>{badge.emoji}</span>
        <span>{action}</span>
      </span>
    )
  }

  const parseDetails = (details: string | null) => {
    if (!details) return null
    try {
      return JSON.parse(details)
    } catch {
      return details
    }
  }

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📋 Audit Logs</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Complete audit trail of all system activities</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={printLogs}
            className="px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition shadow-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
          <button
            onClick={saveFilteredLogs}
            className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-indigo-800 transition shadow-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save JSON
          </button>
          <button
            onClick={exportLogs}
            className="px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition shadow-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search logs by user, action, entity, IP address, or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition"
            >
              Clear Search
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Found <strong className="text-blue-600 dark:text-blue-400">{filteredLogs.length}</strong> matching logs
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Logs</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalLogs.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-xl">
              📊
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Create Actions</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">
                {logs.filter(l => l.action === 'CREATE').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white text-xl">
              ✨
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Updates</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {logs.filter(l => l.action === 'UPDATE').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-xl">
              ✏️
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Deletions</p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {logs.filter(l => l.action === 'DELETE').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white text-xl">
              🗑️
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>🔍</span> Filters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Actions</option>
            <option value="CREATE">✨ Create</option>
            <option value="UPDATE">✏️ Update</option>
            <option value="DELETE">🗑️ Delete</option>
            <option value="LOGIN">🔓 Login</option>
            <option value="LOGOUT">🔒 Logout</option>
            <option value="PAYMENT">💳 Payment</option>
            <option value="REPLY_TICKET">💬 Reply Ticket</option>
          </select>

          <select
            value={filters.entity}
            onChange={(e) => setFilters({ ...filters, entity: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Entities</option>
            <option value="USER">👤 User</option>
            <option value="CLIENT">🏢 Client</option>
            <option value="INVOICE">💰 Invoice</option>
            <option value="SERVICE">⚙️ Service</option>
            <option value="TICKET">🎫 Ticket</option>
            <option value="PRODUCT">📦 Product</option>
            <option value="SERVER">🖥️ Server</option>
          </select>

          <input
            type="email"
            placeholder="User email..."
            value={filters.userEmail}
            onChange={(e) => setFilters({ ...filters, userEmail: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleFilter}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow"
          >
            Apply Filters
          </button>
          <button
            onClick={handleClearFilters}
            className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Showing {filteredLogs.length} of {totalLogs.toLocaleString()} logs
            {searchQuery && <span className="text-blue-600 dark:text-blue-400"> (filtered)</span>}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Entity
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => setSelectedLog(log)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                        {log.userEmail?.charAt(0).toUpperCase() || 'S'}
                      </div>
                      <span className="text-sm text-gray-900">{log.userEmail || 'System'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getActionBadge(log.action)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {log.entity}
                    {log.entityId && (
                      <span className="ml-2 text-xs text-gray-500">#{log.entityId.slice(0, 8)}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                    {log.details ? JSON.stringify(parseDetails(log.details)).slice(0, 50) + '...' : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {log.ipAddress || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedLog(log)
                      }}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              First
            </button>
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Last
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Sticky Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between sticky top-0">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span>📋</span> Audit Log Details
              </h2>
              <button
                onClick={() => setSelectedLog(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              {/* Main Info */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4">Log Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Log ID</p>
                    <p className="text-sm font-mono font-bold text-gray-900 bg-white px-3 py-2 rounded-lg border border-gray-200">
                      {selectedLog.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Timestamp</p>
                    <p className="text-sm font-semibold text-gray-900 bg-white px-3 py-2 rounded-lg border border-gray-200">
                      {new Date(selectedLog.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span>👤</span> User Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-purple-700 mb-1">User ID</p>
                    <p className="text-sm font-mono font-bold text-purple-900 bg-white px-3 py-2 rounded-lg border border-purple-300">
                      {selectedLog.userId || 'System'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-700 mb-1">Email</p>
                    <p className="text-sm font-semibold text-purple-900 bg-white px-3 py-2 rounded-lg border border-purple-300">
                      {selectedLog.userEmail || 'System'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Details */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span>⚡</span> Action Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-blue-700 mb-1">Action Type</p>
                    <div className="bg-white px-3 py-2 rounded-lg border border-blue-300">
                      {getActionBadge(selectedLog.action)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-blue-700 mb-1">Entity Type</p>
                      <p className="text-sm font-semibold text-blue-900 bg-white px-3 py-2 rounded-lg border border-blue-300">
                        {selectedLog.entity}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-700 mb-1">Entity ID</p>
                      <p className="text-sm font-mono text-blue-900 bg-white px-3 py-2 rounded-lg border border-blue-300 truncate">
                        {selectedLog.entityId || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Network Info */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <h3 className="text-sm font-bold text-green-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span>🌐</span> Network Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-green-700 mb-1">IP Address</p>
                    <p className="text-sm font-mono font-bold text-green-900 bg-white px-3 py-2 rounded-lg border border-green-300">
                      {selectedLog.ipAddress || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-green-700 mb-1">User Agent</p>
                    <p className="text-xs text-green-900 bg-white px-3 py-2 rounded-lg border border-green-300 break-all">
                      {selectedLog.userAgent || 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              {selectedLog.details && (
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                  <h3 className="text-sm font-bold text-orange-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span>📄</span> Additional Details
                  </h3>
                  <pre className="text-xs text-orange-900 bg-white px-4 py-3 rounded-lg border border-orange-300 overflow-x-auto font-mono">
                    {JSON.stringify(parseDetails(selectedLog.details), null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Sticky Footer */}
            <div className="bg-gray-50 border-t border-gray-200 p-6 sticky bottom-0">
              <button
                onClick={() => setSelectedLog(null)}
                className="w-full px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

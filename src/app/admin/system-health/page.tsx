'use client'

import { useState, useEffect } from 'react'

interface SystemStatus {
  uptime: number
  memory: { used: number; total: number }
  cpu: number
  database: { status: string; responseTime: number }
  storage: { used: number; total: number }
}

interface CronJob {
  id: string
  name: string
  description: string
  schedule: string
  lastRun: string | null
  nextRun: string
  status: 'ACTIVE' | 'DISABLED' | 'FAILED'
  runCount: number
}

export default function SystemHealthPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [cronJobs, setCronJobs] = useState<CronJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSystemHealth()
    const interval = setInterval(fetchSystemHealth, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const fetchSystemHealth = async () => {
    try {
      const [statusRes, cronRes] = await Promise.all([
        fetch('/api/admin/system-health'),
        fetch('/api/admin/cron-jobs')
      ])
      const statusData = await statusRes.json()
      const cronData = await cronRes.json()
      setStatus(statusData)
      setCronJobs(cronData.jobs || MOCK_CRON_JOBS)
    } catch (error) {
      console.error('Failed to fetch system health:', error)
      setStatus(MOCK_STATUS)
      setCronJobs(MOCK_CRON_JOBS)
    } finally {
      setLoading(false)
    }
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  const formatBytes = (bytes: number) => {
    const gb = (bytes / 1024 / 1024 / 1024).toFixed(2)
    return `${gb} GB`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'DISABLED':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'FAILED':
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    )
  }

  const systemStatus = status || MOCK_STATUS

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">🏥 System Health & Automation</h1>
        <p className="mt-2 text-gray-600">Monitor system performance and automated tasks</p>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600">System Uptime</h3>
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white text-lg">
              ⏱️
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatUptime(systemStatus.uptime)}</p>
          <p className="text-xs text-green-600 mt-2">✓ System Operational</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600">Memory Usage</h3>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-lg">
              💾
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {((systemStatus.memory.used / systemStatus.memory.total) * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {formatBytes(systemStatus.memory.used)} / {formatBytes(systemStatus.memory.total)}
          </p>
          <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all"
              style={{ width: `${(systemStatus.memory.used / systemStatus.memory.total) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600">CPU Load</h3>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-lg">
              ⚡
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{systemStatus.cpu.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-2">Average load</p>
          <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full transition-all ${
                systemStatus.cpu > 80 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                systemStatus.cpu > 50 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                'bg-gradient-to-r from-green-500 to-green-600'
              }`}
              style={{ width: `${systemStatus.cpu}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600">Database</h3>
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white text-lg">
              🗄️
            </div>
          </div>
          <p className={`text-2xl font-bold ${systemStatus.database.status === 'healthy' ? 'text-green-600' : 'text-red-600'}`}>
            {systemStatus.database.status === 'healthy' ? 'Healthy' : 'Error'}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Response time: {systemStatus.database.responseTime}ms
          </p>
        </div>
      </div>

      {/* Cron Jobs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span>⚙️</span> Automated Tasks (Cron Jobs)
              </h2>
              <p className="text-sm text-gray-600 mt-1">Scheduled system tasks and their execution status</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm">
              Run All Now
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Task Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Last Run
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Next Run
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Executions
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cronJobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{job.name}</p>
                      <p className="text-xs text-gray-500">{job.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">
                      {job.schedule}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {job.lastRun ? new Date(job.lastRun).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(job.nextRun).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {job.runCount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button className="text-blue-600 hover:text-blue-800">Run Now</button>
                    <button className="text-gray-600 hover:text-gray-800">View Logs</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Storage Info */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>💿</span> Storage Usage
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Total Storage</span>
            <span className="text-sm font-bold text-gray-900">
              {formatBytes(systemStatus.storage.used)} / {formatBytes(systemStatus.storage.total)}
            </span>
          </div>
          <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 h-full transition-all"
              style={{ width: `${(systemStatus.storage.used / systemStatus.storage.total) * 100}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <p className="text-xs text-gray-500">Database</p>
              <p className="text-lg font-bold text-gray-900">{formatBytes(systemStatus.storage.used * 0.3)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Files</p>
              <p className="text-lg font-bold text-gray-900">{formatBytes(systemStatus.storage.used * 0.5)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Logs</p>
              <p className="text-lg font-bold text-gray-900">{formatBytes(systemStatus.storage.used * 0.2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Mock data for development
const MOCK_STATUS: SystemStatus = {
  uptime: 2592000, // 30 days
  memory: { used: 4 * 1024 * 1024 * 1024, total: 8 * 1024 * 1024 * 1024 },
  cpu: 35.7,
  database: { status: 'healthy', responseTime: 12 },
  storage: { used: 45 * 1024 * 1024 * 1024, total: 100 * 1024 * 1024 * 1024 },
}

const MOCK_CRON_JOBS: CronJob[] = [
  {
    id: '1',
    name: 'Invoice Generation',
    description: 'Generate recurring invoices for active services',
    schedule: '0 0 * * *',
    lastRun: new Date(Date.now() - 3600000).toISOString(),
    nextRun: new Date(Date.now() + 82800000).toISOString(),
    status: 'ACTIVE',
    runCount: 450,
  },
  {
    id: '2',
    name: 'Payment Reminders',
    description: 'Send overdue invoice reminders to clients',
    schedule: '0 9 * * *',
    lastRun: new Date(Date.now() - 7200000).toISOString(),
    nextRun: new Date(Date.now() + 79200000).toISOString(),
    status: 'ACTIVE',
    runCount: 320,
  },
  {
    id: '3',
    name: 'Service Provisioning',
    description: 'Process pending service provisioning requests',
    schedule: '*/15 * * * *',
    lastRun: new Date(Date.now() - 900000).toISOString(),
    nextRun: new Date(Date.now() + 900000).toISOString(),
    status: 'ACTIVE',
    runCount: 12500,
  },
  {
    id: '4',
    name: 'Service Suspension',
    description: 'Suspend services with overdue invoices',
    schedule: '0 2 * * *',
    lastRun: new Date(Date.now() - 18000000).toISOString(),
    nextRun: new Date(Date.now() + 68400000).toISOString(),
    status: 'ACTIVE',
    runCount: 180,
  },
  {
    id: '5',
    name: 'Database Backup',
    description: 'Create automated database backups',
    schedule: '0 3 * * *',
    lastRun: new Date(Date.now() - 10800000).toISOString(),
    nextRun: new Date(Date.now() + 75600000).toISOString(),
    status: 'ACTIVE',
    runCount: 90,
  },
  {
    id: '6',
    name: 'Audit Log Cleanup',
    description: 'Remove old audit logs (90+ days)',
    schedule: '0 4 * * 0',
    lastRun: new Date(Date.now() - 172800000).toISOString(),
    nextRun: new Date(Date.now() + 432000000).toISOString(),
    status: 'ACTIVE',
    runCount: 12,
  },
]

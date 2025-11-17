'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function QuickActionsPage() {
  const router = useRouter()
  const [showModal, setShowModal] = useState<string | null>(null)

  const quickActions = [
    {
      id: 'create-invoice',
      title: 'Create Invoice',
      description: 'Generate a new invoice for a client',
      icon: '📄',
      color: 'from-blue-500 to-blue-600',
      action: () => router.push('/admin/invoices'),
    },
    {
      id: 'add-client',
      title: 'Add Client',
      description: 'Register a new client account',
      icon: '👤',
      color: 'from-green-500 to-green-600',
      action: () => router.push('/admin/clients'),
    },
    {
      id: 'create-service',
      title: 'Create Service',
      description: 'Set up a new hosting service',
      icon: '🚀',
      color: 'from-purple-500 to-purple-600',
      action: () => router.push('/admin/services'),
    },
    {
      id: 'add-product',
      title: 'Add Product',
      description: 'Create a new product offering',
      icon: '📦',
      color: 'from-orange-500 to-orange-600',
      action: () => router.push('/admin/products'),
    },
    {
      id: 'generate-coupon',
      title: 'Generate Coupon',
      description: 'Create a discount coupon code',
      icon: '🎟️',
      color: 'from-pink-500 to-pink-600',
      action: () => router.push('/admin/coupons'),
    },
    {
      id: 'add-server',
      title: 'Add Server',
      description: 'Register a new hosting server',
      icon: '🖥️',
      color: 'from-cyan-500 to-cyan-600',
      action: () => router.push('/admin/servers'),
    },
    {
      id: 'send-announcement',
      title: 'Send Announcement',
      description: 'Create a system-wide announcement',
      icon: '📢',
      color: 'from-yellow-500 to-yellow-600',
      action: () => router.push('/admin/announcements'),
    },
    {
      id: 'bulk-email',
      title: 'Bulk Email',
      description: 'Send email to multiple clients',
      icon: '📧',
      color: 'from-indigo-500 to-indigo-600',
      action: () => setShowModal('bulk-email'),
    },
    {
      id: 'export-data',
      title: 'Export Data',
      description: 'Download system data as CSV',
      icon: '📊',
      color: 'from-teal-500 to-teal-600',
      action: () => setShowModal('export-data'),
    },
    {
      id: 'system-backup',
      title: 'System Backup',
      description: 'Create a full system backup',
      icon: '💾',
      color: 'from-red-500 to-red-600',
      action: () => setShowModal('backup'),
    },
    {
      id: 'apply-credits',
      title: 'Apply Credits',
      description: 'Add account credits to clients',
      icon: '💰',
      color: 'from-emerald-500 to-emerald-600',
      action: () => setShowModal('credits'),
    },
    {
      id: 'suspend-service',
      title: 'Suspend Service',
      description: 'Temporarily suspend a service',
      icon: '⏸️',
      color: 'from-gray-500 to-gray-600',
      action: () => setShowModal('suspend'),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quick Actions</h1>
        <p className="mt-2 text-gray-600">Fast access to common administrative tasks</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Pending Invoices', value: '12', icon: '📄', color: 'blue' },
          { label: 'Active Services', value: '248', icon: '🚀', color: 'green' },
          { label: 'Open Tickets', value: '5', icon: '🎫', color: 'orange' },
          { label: 'Monthly Revenue', value: '$18.5K', icon: '💰', color: 'purple' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            className="group relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-2xl transition-all duration-300 text-left"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
            <div className="relative">
              <div className={`w-14 h-14 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                {action.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{action.title}</h3>
              <p className="text-sm text-gray-600">{action.description}</p>
              <div className="mt-4 flex items-center text-sm font-semibold text-gray-400 group-hover:text-blue-600 transition">
                <span>Get started</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {[
            { action: 'Invoice #1234 created for John Doe', time: '2 minutes ago', icon: '📄' },
            { action: 'New service activated for Acme Corp', time: '15 minutes ago', icon: '🚀' },
            { action: 'Payment received from Jane Smith', time: '1 hour ago', icon: '💰' },
            { action: 'Support ticket #89 resolved', time: '2 hours ago', icon: '✅' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition">
              <span className="text-2xl">{activity.icon}</span>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.action}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

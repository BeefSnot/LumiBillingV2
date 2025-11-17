'use client'

import { useState, useEffect } from 'react'

interface PaymentGateway {
  id: string
  name: string
  type: 'STRIPE' | 'PAYPAL' | 'AUTHORIZE_NET' | 'SQUARE' | 'RAZORPAY'
  enabled: boolean
  testMode: boolean
  apiKey?: string
  apiSecret?: string
  webhookUrl?: string
  config: Record<string, any>
}

const GATEWAY_TYPES = [
  { value: 'STRIPE', label: 'Stripe', icon: '💳', color: 'from-purple-500 to-purple-600' },
  { value: 'PAYPAL', label: 'PayPal', icon: '🅿️', color: 'from-blue-500 to-blue-600' },
  { value: 'AUTHORIZE_NET', label: 'Authorize.Net', icon: '🔐', color: 'from-red-500 to-red-600' },
  { value: 'SQUARE', label: 'Square', icon: '⬛', color: 'from-gray-700 to-gray-800' },
  { value: 'RAZORPAY', label: 'Razorpay', icon: '⚡', color: 'from-blue-600 to-indigo-600' },
]

export default function PaymentGatewaysPage() {
  const [gateways, setGateways] = useState<PaymentGateway[]>([])
  const [loading, setLoading] = useState(true)
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null)

  useEffect(() => {
    fetchGateways()
  }, [])

  const fetchGateways = async () => {
    try {
      const response = await fetch('/api/admin/payment-gateways')
      const data = await response.json()
      setGateways(data.gateways || MOCK_GATEWAYS)
    } catch (error) {
      console.error('Failed to fetch payment gateways:', error)
      setGateways(MOCK_GATEWAYS)
    } finally {
      setLoading(false)
    }
  }

  const toggleGateway = async (id: string, enabled: boolean) => {
    try {
      await fetch('/api/admin/payment-gateways', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, enabled }),
      })
      setGateways(gateways.map(g => g.id === id ? { ...g, enabled } : g))
    } catch (error) {
      console.error('Failed to toggle gateway:', error)
    }
  }

  const saveGateway = async () => {
    if (!editingGateway) return
    
    try {
      await fetch('/api/admin/payment-gateways', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingGateway),
      })
      setGateways(gateways.map(g => g.id === editingGateway.id ? editingGateway : g))
      setEditingGateway(null)
    } catch (error) {
      console.error('Failed to save gateway:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">💳 Payment Gateways</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Configure payment processing integrations</p>
      </div>

      {/* Active Gateways Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Gateways</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{gateways.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-xl">
              💳
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Gateways</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {gateways.filter(g => g.enabled).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white text-xl">
              ✅
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Test Mode</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">
                {gateways.filter(g => g.testMode && g.enabled).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white text-xl">
              🧪
            </div>
          </div>
        </div>
      </div>

      {/* Gateway Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {gateways.map((gateway) => {
          const gatewayType = GATEWAY_TYPES.find(t => t.value === gateway.type)
          return (
            <div
              key={gateway.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className={`bg-gradient-to-r ${gatewayType?.color} p-6`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-3xl">
                      {gatewayType?.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{gateway.name}</h3>
                      <p className="text-sm text-white/80">{gatewayType?.label}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gateway.enabled}
                      onChange={(e) => toggleGateway(gateway.id, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-8 bg-white/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-white/50"></div>
                  </label>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    gateway.enabled 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                  }`}>
                    {gateway.enabled ? '✓ Active' : '○ Disabled'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mode</span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    gateway.testMode 
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400' 
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                  }`}>
                    {gateway.testMode ? '🧪 Test Mode' : '🚀 Live Mode'}
                  </span>
                </div>

                {gateway.apiKey && (
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">API Key</span>
                    <p className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg mt-1 text-gray-600 dark:text-gray-400 truncate">
                      {gateway.apiKey.slice(0, 20)}...
                    </p>
                  </div>
                )}

                {gateway.webhookUrl && (
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Webhook URL</span>
                    <p className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg mt-1 text-gray-600 dark:text-gray-400 truncate">
                      {gateway.webhookUrl}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setEditingGateway(gateway)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow"
                >
                  Configure Gateway
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit Gateway Modal */}
      {editingGateway && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Configure {editingGateway.name}</h2>
              <button
                onClick={() => setEditingGateway(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gateway Name
                </label>
                <input
                  type="text"
                  value={editingGateway.name}
                  onChange={(e) => setEditingGateway({ ...editingGateway, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingGateway.testMode}
                    onChange={(e) => setEditingGateway({ ...editingGateway, testMode: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Test Mode (Use sandbox credentials)</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Key / Public Key
                </label>
                <input
                  type="text"
                  value={editingGateway.apiKey || ''}
                  onChange={(e) => setEditingGateway({ ...editingGateway, apiKey: e.target.value })}
                  placeholder="sk_test_..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Secret / Private Key
                </label>
                <input
                  type="password"
                  value={editingGateway.apiSecret || ''}
                  onChange={(e) => setEditingGateway({ ...editingGateway, apiSecret: e.target.value })}
                  placeholder="••••••••••••••••"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Webhook URL
                </label>
                <input
                  type="text"
                  value={editingGateway.webhookUrl || ''}
                  onChange={(e) => setEditingGateway({ ...editingGateway, webhookUrl: e.target.value })}
                  placeholder="https://yourdomain.com/api/webhooks/stripe"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Configure this URL in your payment provider's webhook settings
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <h4 className="text-sm font-bold text-blue-900 dark:text-blue-400 mb-2">📘 Setup Instructions</h4>
                <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
                  <li>Sign up for a {editingGateway.name} account</li>
                  <li>Navigate to API settings in your dashboard</li>
                  <li>Copy your API credentials and paste above</li>
                  <li>Configure the webhook URL in your provider settings</li>
                  <li>Test the integration before going live</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600 p-6 flex gap-3">
              <button
                onClick={saveGateway}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-lg"
              >
                Save Configuration
              </button>
              <button
                onClick={() => setEditingGateway(null)}
                className="px-6 py-3 bg-white dark:bg-gray-600 text-gray-700 dark:text-white border border-gray-300 dark:border-gray-500 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Mock data for development
const MOCK_GATEWAYS: PaymentGateway[] = [
  {
    id: '1',
    name: 'Stripe',
    type: 'STRIPE',
    enabled: true,
    testMode: true,
    apiKey: 'pk_test_51234567890abcdefghij',
    apiSecret: 'sk_test_51234567890abcdefghij',
    webhookUrl: 'https://yourdomain.com/api/webhooks/stripe',
    config: {},
  },
  {
    id: '2',
    name: 'PayPal',
    type: 'PAYPAL',
    enabled: true,
    testMode: false,
    apiKey: 'AZabc123def456ghi789jkl',
    apiSecret: 'EPabc123def456ghi789jkl',
    webhookUrl: 'https://yourdomain.com/api/webhooks/paypal',
    config: {},
  },
  {
    id: '3',
    name: 'Authorize.Net',
    type: 'AUTHORIZE_NET',
    enabled: false,
    testMode: true,
    config: {},
  },
  {
    id: '4',
    name: 'Square',
    type: 'SQUARE',
    enabled: false,
    testMode: true,
    config: {},
  },
  {
    id: '5',
    name: 'Razorpay',
    type: 'RAZORPAY',
    enabled: false,
    testMode: true,
    config: {},
  },
]

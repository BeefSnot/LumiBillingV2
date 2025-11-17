'use client'

import { useState, useEffect } from 'react'

interface TaxRule {
  id: string
  name: string
  country: string
  state?: string
  region?: string
  taxType: 'VAT' | 'GST' | 'SALES_TAX' | 'OTHER'
  rate: number
  isDefault: boolean
  enabled: boolean
  createdAt: string
}

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IN', name: 'India' },
  { code: 'JP', name: 'Japan' },
]

const TAX_TYPES = [
  { value: 'VAT', label: 'VAT (Value Added Tax)', icon: '🇪🇺' },
  { value: 'GST', label: 'GST (Goods & Services Tax)', icon: '🌏' },
  { value: 'SALES_TAX', label: 'Sales Tax', icon: '🇺🇸' },
  { value: 'OTHER', label: 'Other', icon: '📊' },
]

export default function TaxRulesPage() {
  const [taxRules, setTaxRules] = useState<TaxRule[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRule, setEditingRule] = useState<TaxRule | null>(null)
  const [creatingNew, setCreatingNew] = useState(false)

  useEffect(() => {
    fetchTaxRules()
  }, [])

  const fetchTaxRules = async () => {
    try {
      const response = await fetch('/api/admin/tax-rules')
      const data = await response.json()
      setTaxRules(data.taxRules || MOCK_TAX_RULES)
    } catch (error) {
      console.error('Failed to fetch tax rules:', error)
      setTaxRules(MOCK_TAX_RULES)
    } finally {
      setLoading(false)
    }
  }

  const createNewRule = () => {
    setEditingRule({
      id: '',
      name: '',
      country: '',
      taxType: 'VAT',
      rate: 0,
      isDefault: false,
      enabled: true,
      createdAt: new Date().toISOString(),
    })
    setCreatingNew(true)
  }

  const saveRule = async () => {
    if (!editingRule) return

    try {
      const method = creatingNew ? 'POST' : 'PUT'
      await fetch('/api/admin/tax-rules', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingRule),
      })

      if (creatingNew) {
        setTaxRules([...taxRules, { ...editingRule, id: Date.now().toString() }])
      } else {
        setTaxRules(taxRules.map(r => r.id === editingRule.id ? editingRule : r))
      }

      setEditingRule(null)
      setCreatingNew(false)
    } catch (error) {
      console.error('Failed to save tax rule:', error)
    }
  }

  const deleteRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tax rule?')) return

    try {
      await fetch(`/api/admin/tax-rules?id=${id}`, { method: 'DELETE' })
      setTaxRules(taxRules.filter(r => r.id !== id))
    } catch (error) {
      console.error('Failed to delete tax rule:', error)
    }
  }

  const toggleRule = async (id: string, enabled: boolean) => {
    try {
      await fetch('/api/admin/tax-rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, enabled }),
      })
      setTaxRules(taxRules.map(r => r.id === id ? { ...r, enabled } : r))
    } catch (error) {
      console.error('Failed to toggle tax rule:', error)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📊 Tax Rules</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage tax rates by country, state, and region</p>
        </div>
        <button
          onClick={createNewRule}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-lg flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Tax Rule
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Rules</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{taxRules.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-xl">
              📊
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Rules</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {taxRules.filter(r => r.enabled).length}
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Countries</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">
                {new Set(taxRules.map(r => r.country)).size}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl">
              🌍
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Tax Rate</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">
                {(taxRules.reduce((acc, r) => acc + r.rate, 0) / taxRules.length).toFixed(1)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white text-xl">
              📈
            </div>
          </div>
        </div>
      </div>

      {/* Tax Rules Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tax Rules Configuration</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Tax Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {taxRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{rule.name}</span>
                      {rule.isDefault && (
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs font-bold rounded">
                          DEFAULT
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                    {COUNTRIES.find(c => c.code === rule.country)?.name || rule.country}
                    {rule.state && `, ${rule.state}`}
                    {rule.region && ` (${rule.region})`}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400">
                      {TAX_TYPES.find(t => t.value === rule.taxType)?.icon} {rule.taxType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{rule.rate}%</span>
                  </td>
                  <td className="px-6 py-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={(e) => toggleRule(rule.id, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium space-x-3">
                    <button
                      onClick={() => { setEditingRule(rule); setCreatingNew(false) }}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Create Modal */}
      {editingRule && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">{creatingNew ? 'Create' : 'Edit'} Tax Rule</h2>
              <button
                onClick={() => { setEditingRule(null); setCreatingNew(false) }}
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
                  Tax Name *
                </label>
                <input
                  type="text"
                  value={editingRule.name}
                  onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                  placeholder="e.g., California Sales Tax"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Country *
                  </label>
                  <select
                    value={editingRule.country}
                    onChange={(e) => setEditingRule({ ...editingRule, country: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Country</option>
                    {COUNTRIES.map(country => (
                      <option key={country.code} value={country.code}>{country.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    State / Province
                  </label>
                  <input
                    type="text"
                    value={editingRule.state || ''}
                    onChange={(e) => setEditingRule({ ...editingRule, state: e.target.value })}
                    placeholder="e.g., California, Ontario"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Region / City
                </label>
                <input
                  type="text"
                  value={editingRule.region || ''}
                  onChange={(e) => setEditingRule({ ...editingRule, region: e.target.value })}
                  placeholder="e.g., Los Angeles, Greater Toronto"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tax Type *
                  </label>
                  <select
                    value={editingRule.taxType}
                    onChange={(e) => setEditingRule({ ...editingRule, taxType: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {TAX_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tax Rate (%) *
                  </label>
                  <input
                    type="number"
                    value={editingRule.rate}
                    onChange={(e) => setEditingRule({ ...editingRule, rate: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingRule.isDefault}
                    onChange={(e) => setEditingRule({ ...editingRule, isDefault: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Set as default tax rule</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingRule.enabled}
                    onChange={(e) => setEditingRule({ ...editingRule, enabled: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable this rule</span>
                </label>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                <h4 className="text-sm font-bold text-yellow-900 dark:text-yellow-400 mb-2">⚠️ Important Notes</h4>
                <ul className="text-xs text-yellow-800 dark:text-yellow-300 space-y-1 list-disc list-inside">
                  <li>Tax rules are applied based on billing address</li>
                  <li>More specific rules (with state/region) take priority</li>
                  <li>Only one rule can be set as default</li>
                  <li>Disabled rules won't be applied to invoices</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600 p-6 flex gap-3">
              <button
                onClick={saveRule}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-lg"
              >
                {creatingNew ? 'Create Tax Rule' : 'Save Changes'}
              </button>
              <button
                onClick={() => { setEditingRule(null); setCreatingNew(false) }}
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
const MOCK_TAX_RULES: TaxRule[] = [
  {
    id: '1',
    name: 'US Federal Sales Tax',
    country: 'US',
    taxType: 'SALES_TAX',
    rate: 6.5,
    isDefault: true,
    enabled: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'California Sales Tax',
    country: 'US',
    state: 'California',
    taxType: 'SALES_TAX',
    rate: 7.25,
    isDefault: false,
    enabled: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'UK VAT',
    country: 'GB',
    taxType: 'VAT',
    rate: 20,
    isDefault: false,
    enabled: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'India GST',
    country: 'IN',
    taxType: 'GST',
    rate: 18,
    isDefault: false,
    enabled: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '5',
    name: 'German VAT',
    country: 'DE',
    taxType: 'VAT',
    rate: 19,
    isDefault: false,
    enabled: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
]

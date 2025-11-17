'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CreateServerModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function CreateServerModal({ onClose, onSuccess }: CreateServerModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    hostname: '',
    ipAddress: '',
    type: 'DIRECTADMIN',
    apiUrl: '',
    username: '',
    password: '',
    apiKey: '',
    apiVersion: 'v2',
    maxAccounts: '',
    active: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [testing, setTesting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/admin/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create server')
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTestConnection = async () => {
    setError('')
    setTesting(true)

    try {
      const response = await fetch('/api/admin/servers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formData.type,
          apiUrl: formData.apiUrl,
          username: formData.username,
          password: formData.password,
          apiKey: formData.apiKey,
          apiVersion: formData.apiVersion,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Connection test failed')
      }

      alert('Connection successful!')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl my-8">
        <CardHeader>
          <CardTitle>Create New Server</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Server Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Server 1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Server Type *</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="DIRECTADMIN">DirectAdmin</option>
                  <option value="VIRTFUSION">VirtFusion</option>
                  <option value="PTERODACTYL">Pterodactyl</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hostname">Hostname *</Label>
                <Input
                  id="hostname"
                  value={formData.hostname}
                  onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                  placeholder="server1.example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="ipAddress">IP Address *</Label>
                <Input
                  id="ipAddress"
                  value={formData.ipAddress}
                  onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                  placeholder="192.168.1.1"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="apiUrl">API URL *</Label>
              <Input
                id="apiUrl"
                value={formData.apiUrl}
                onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
                placeholder="https://server1.example.com:2222"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="admin"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            {formData.type === 'DIRECTADMIN' && (
              <div>
                <Label htmlFor="apiVersion">DirectAdmin API Version</Label>
                <select
                  id="apiVersion"
                  value={formData.apiVersion}
                  onChange={(e) => setFormData({ ...formData, apiVersion: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="v2">API v2 (Recommended)</option>
                  <option value="v1">API v1 (Legacy)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  v2 uses JSON and modern REST endpoints. v1 uses legacy command-based API.
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder="Optional - for token-based authentication"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use either username/password OR API key depending on your server configuration
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxAccounts">Max Accounts</Label>
                <Input
                  id="maxAccounts"
                  type="number"
                  value={formData.maxAccounts}
                  onChange={(e) => setFormData({ ...formData, maxAccounts: e.target.value })}
                  placeholder="Unlimited if empty"
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={testing || !formData.apiUrl}
                  className="w-full"
                >
                  {testing ? 'Testing...' : 'Test Connection'}
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="active" className="cursor-pointer">
                Server is active and available for provisioning
              </Label>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Server'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

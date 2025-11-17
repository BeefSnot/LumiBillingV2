'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface EditProductModalProps {
  product: {
    id: string
    name: string
    description: string | null
    type: string
    price: number
    billingCycle: string
    setupFee: number | null
    serverId: string | null
    diskSpace: number | null
    bandwidth: number | null
    ram: number | null
    cpu: number | null
    active: boolean
  }
  onClose: () => void
  onSuccess: () => void
}

export default function EditProductModal({ product, onClose, onSuccess }: EditProductModalProps) {
  const [servers, setServers] = useState<Array<{ id: string; name: string }>>([])
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description || '',
    type: product.type,
    price: product.price.toString(),
    billingCycle: product.billingCycle,
    setupFee: product.setupFee?.toString() || '',
    serverId: product.serverId || '',
    diskSpace: product.diskSpace?.toString() || '',
    bandwidth: product.bandwidth?.toString() || '',
    ram: product.ram?.toString() || '',
    cpu: product.cpu?.toString() || '',
    active: product.active,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/servers')
      .then(res => res.json())
      .then(data => setServers(data.servers || []))
      .catch(console.error)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, ...formData }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update product')
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl my-8">
        <CardHeader>
          <CardTitle>Edit Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Type *</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="HOSTING">Web Hosting</option>
                  <option value="VPS">VPS</option>
                  <option value="GAME_SERVER">Game Server</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border rounded-md"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="billingCycle">Billing Cycle *</Label>
                <select
                  id="billingCycle"
                  value={formData.billingCycle}
                  onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="ANNUALLY">Annually</option>
                </select>
              </div>
              <div>
                <Label htmlFor="setupFee">Setup Fee</Label>
                <Input
                  id="setupFee"
                  type="number"
                  step="0.01"
                  value={formData.setupFee}
                  onChange={(e) => setFormData({ ...formData, setupFee: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="serverId">Server</Label>
              <select
                id="serverId"
                value={formData.serverId}
                onChange={(e) => setFormData({ ...formData, serverId: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">None</option>
                {servers.map((server) => (
                  <option key={server.id} value={server.id}>
                    {server.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="diskSpace">Disk (GB)</Label>
                <Input
                  id="diskSpace"
                  type="number"
                  value={formData.diskSpace}
                  onChange={(e) => setFormData({ ...formData, diskSpace: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="bandwidth">Bandwidth (GB)</Label>
                <Input
                  id="bandwidth"
                  type="number"
                  value={formData.bandwidth}
                  onChange={(e) => setFormData({ ...formData, bandwidth: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="ram">RAM (GB)</Label>
                <Input
                  id="ram"
                  type="number"
                  value={formData.ram}
                  onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="cpu">CPU Cores</Label>
                <Input
                  id="cpu"
                  type="number"
                  value={formData.cpu}
                  onChange={(e) => setFormData({ ...formData, cpu: e.target.value })}
                />
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
                Product is active and visible to clients
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
                {loading ? 'Updating...' : 'Update Product'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface GenerateGiftCardModalProps {
  onClose: () => void
  onSuccess: (cards: any[]) => void
}

export default function GenerateGiftCardModal({ onClose, onSuccess }: GenerateGiftCardModalProps) {
  const [formData, setFormData] = useState({
    balance: '',
    expiresAt: '',
    quantity: '1',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.balance || parseFloat(formData.balance) <= 0) {
        throw new Error('Balance must be greater than 0')
      }

      const quantity = parseInt(formData.quantity)
      if (quantity < 1 || quantity > 100) {
        throw new Error('Quantity must be between 1 and 100')
      }

      const response = await fetch('/api/admin/gift-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate gift card')
      }

      onSuccess(data.giftCards)
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Generate Gift Card</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="balance">Gift Card Balance *</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                placeholder="50.00"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                The initial balance amount for the gift card
              </p>
            </div>

            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                min="1"
                max="100"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Number of gift cards to generate (max 100)
              </p>
            </div>

            <div>
              <Label htmlFor="expiresAt">Expiration Date</Label>
              <Input
                id="expiresAt"
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty for no expiration
              </p>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800">
              <p className="font-medium">Note:</p>
              <p className="mt-1">
                {parseInt(formData.quantity) > 1 
                  ? `${formData.quantity} unique gift card codes will be generated.`
                  : 'A unique gift card code will be generated.'
                }
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Generating...' : 'Generate'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

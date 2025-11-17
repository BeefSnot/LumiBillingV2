'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import GenerateGiftCardModal from '@/components/GenerateGiftCardModal'

interface GiftCard {
  id: string
  code: string
  initialBalance: number
  balance: number
  redeemedBy: string | null
  redeemedAt: Date | null
  expiresAt: Date | null
}

export default function AdminGiftCardsPage() {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([])
  const [loading, setLoading] = useState(true)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([])

  const fetchGiftCards = async () => {
    try {
      const res = await fetch('/api/admin/gift-cards')
      const data = await res.json()
      setGiftCards(data.giftCards || [])
    } catch (error) {
      console.error('Failed to fetch gift cards:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGiftCards()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gift card?')) {
      return
    }

    try {
      const res = await fetch(`/api/admin/gift-cards?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchGiftCards()
      } else {
        alert('Failed to delete gift card')
      }
    } catch (error) {
      console.error('Failed to delete gift card:', error)
      alert('Failed to delete gift card')
    }
  }

  const handleGenerateSuccess = (cards: any[]) => {
    fetchGiftCards()
    const codes = cards.map(c => c.code)
    setGeneratedCodes(codes)
    
    // Show generated codes in alert
    alert(`Successfully generated ${codes.length} gift card(s):\n\n${codes.join('\n')}\n\nCopy these codes now - they won't be shown again!`)
  }

  const exportCSV = () => {
    const csv = [
      ['Code', 'Initial Balance', 'Current Balance', 'Redeemed By', 'Redeemed At', 'Expires', 'Status'].join(','),
      ...giftCards.map(card => {
        const now = new Date()
        const isExpired = card.expiresAt && new Date(card.expiresAt) < now
        const status = isExpired ? 'Expired' : card.balance > 0 ? 'Active' : 'Used'
        return [
          card.code,
          card.initialBalance.toFixed(2),
          card.balance.toFixed(2),
          card.redeemedBy || '',
          card.redeemedAt ? new Date(card.redeemedAt).toLocaleDateString() : '',
          card.expiresAt ? new Date(card.expiresAt).toLocaleDateString() : 'Never',
          status
        ].join(',')
      })
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gift-cards-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading gift cards...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gift Cards</h1>
          <p className="mt-2 text-sm text-gray-600">
            Generate and manage gift card codes
          </p>
        </div>
        <div className="flex space-x-3">
          {giftCards.length > 0 && (
            <Button variant="outline" onClick={exportCSV}>
              Export CSV
            </Button>
          )}
          <Button onClick={() => setShowGenerateModal(true)}>
            Generate Gift Card
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Gift Cards ({giftCards.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Initial Balance</TableHead>
                <TableHead>Current Balance</TableHead>
                <TableHead>Redeemed By</TableHead>
                <TableHead>Redeemed At</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {giftCards.map((card) => {
                const now = new Date()
                const isExpired = card.expiresAt && new Date(card.expiresAt) < now
                const isRedeemed = card.redeemedAt !== null
                const isValid = !isExpired && card.balance > 0

                return (
                  <TableRow key={card.id}>
                    <TableCell className="font-mono font-medium">{card.code}</TableCell>
                    <TableCell>${card.initialBalance.toFixed(2)}</TableCell>
                    <TableCell className="font-medium">${card.balance.toFixed(2)}</TableCell>
                    <TableCell className="text-sm">
                      {card.redeemedBy || '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {card.redeemedAt ? formatDate(card.redeemedAt) : '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {card.expiresAt ? formatDate(card.expiresAt) : 'Never'}
                    </TableCell>
                    <TableCell>
                      {isValid ? (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                          Active
                        </span>
                      ) : isExpired ? (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                          Expired
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                          Used
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(card.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
              {giftCards.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No gift cards found. Generate your first gift card to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showGenerateModal && (
        <GenerateGiftCardModal
          onClose={() => setShowGenerateModal(false)}
          onSuccess={handleGenerateSuccess}
        />
      )}
    </div>
  )
}

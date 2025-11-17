'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import CreateCouponModal from '@/components/CreateCouponModal'

interface Coupon {
  id: string
  code: string
  type: string
  value: number
  maxUses: number | null
  usedCount: number
  validFrom: Date | null
  validUntil: Date | null
  active: boolean
  _count: {
    orders: number
  }
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/admin/coupons')
      const data = await res.json()
      setCoupons(data.coupons || [])
    } catch (error) {
      console.error('Failed to fetch coupons:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) {
      return
    }

    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchCoupons()
      } else {
        alert('Failed to delete coupon')
      }
    } catch (error) {
      console.error('Failed to delete coupon:', error)
      alert('Failed to delete coupon')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading coupons...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coupons</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage discount codes
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          Create Coupon
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Coupons ({coupons.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Uses</TableHead>
                <TableHead>Max Uses</TableHead>
                <TableHead>Valid From</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => {
                const now = new Date()
                const isValid = 
                  coupon.active &&
                  (!coupon.validFrom || new Date(coupon.validFrom) <= now) &&
                  (!coupon.validUntil || new Date(coupon.validUntil) >= now) &&
                  (!coupon.maxUses || coupon.usedCount < coupon.maxUses)

                return (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
                    <TableCell className="capitalize">{coupon.type.toLowerCase()}</TableCell>
                    <TableCell>
                      {coupon.type === 'PERCENTAGE' 
                        ? `${coupon.value}%` 
                        : `$${coupon.value.toFixed(2)}`
                      }
                    </TableCell>
                    <TableCell>{coupon.usedCount}</TableCell>
                    <TableCell>{coupon.maxUses || 'Unlimited'}</TableCell>
                    <TableCell className="text-sm">
                      {coupon.validFrom ? formatDate(coupon.validFrom) : '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {coupon.validUntil ? formatDate(coupon.validUntil) : '-'}
                    </TableCell>
                    <TableCell>
                      {isValid ? (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                          Valid
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                          Inactive
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(coupon.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
              {coupons.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    No coupons found. Create your first coupon to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showCreateModal && (
        <CreateCouponModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchCoupons()
            setShowCreateModal(false)
          }}
        />
      )}
    </div>
  )
}

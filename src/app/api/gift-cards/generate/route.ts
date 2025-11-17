import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Generate gift card
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { balance, expiresAt } = await req.json()

    if (!balance || balance <= 0) {
      return NextResponse.json({ error: 'Invalid balance' }, { status: 400 })
    }

    // Generate unique code
    const code = crypto.randomBytes(8).toString('hex').toUpperCase()

    const giftCard = await prisma.giftCard.create({
      data: {
        code,
        initialBalance: balance,
        balance,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      }
    })

    return NextResponse.json(giftCard)
  } catch (error) {
    console.error('Gift card creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create gift card' },
      { status: 500 }
    )
  }
}

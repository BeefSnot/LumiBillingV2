import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Redeem gift card
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { code } = await req.json()

    // Find gift card
    const giftCard = await prisma.giftCard.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!giftCard) {
      return NextResponse.json({ error: 'Invalid gift card code' }, { status: 400 })
    }

    // Check if already redeemed
    if (giftCard.redeemedAt) {
      return NextResponse.json({ error: 'Gift card already redeemed' }, { status: 400 })
    }

    // Check expiration
    if (giftCard.expiresAt && new Date(giftCard.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Gift card has expired' }, { status: 400 })
    }

    // Check if balance is available
    if (giftCard.balance <= 0) {
      return NextResponse.json({ error: 'Gift card has no balance' }, { status: 400 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Redeem gift card - add balance to user account
    const [updatedUser, updatedGiftCard] = await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          balance: {
            increment: giftCard.balance,
          }
        }
      }),
      prisma.giftCard.update({
        where: { id: giftCard.id },
        data: {
          redeemedAt: new Date(),
          redeemedBy: user.email,
          balance: 0,
        }
      })
    ])

    return NextResponse.json({
      success: true,
      amount: giftCard.balance,
      newBalance: updatedUser.balance,
    })
  } catch (error) {
    console.error('Gift card redemption error:', error)
    return NextResponse.json(
      { error: 'Failed to redeem gift card' },
      { status: 500 }
    )
  }
}

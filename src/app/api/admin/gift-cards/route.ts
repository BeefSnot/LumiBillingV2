import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function generateGiftCardCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) code += '-'
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const giftCards = await prisma.giftCard.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ giftCards })
  } catch (error) {
    console.error('Gift cards fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch gift cards' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { balance, expiresAt, quantity } = body

    if (balance === undefined || balance <= 0) {
      return NextResponse.json({ error: 'Invalid balance amount' }, { status: 400 })
    }

    const numCards = quantity && quantity > 1 ? parseInt(quantity) : 1

    if (numCards > 100) {
      return NextResponse.json({ error: 'Cannot generate more than 100 cards at once' }, { status: 400 })
    }

    const giftCards = []
    
    for (let i = 0; i < numCards; i++) {
      let code = generateGiftCardCode()
      
      // Ensure unique code
      let attempts = 0
      while (attempts < 10) {
        const existing = await prisma.giftCard.findUnique({
          where: { code },
        })
        if (!existing) break
        code = generateGiftCardCode()
        attempts++
      }

      const giftCard = await prisma.giftCard.create({
        data: {
          code,
          initialBalance: parseFloat(balance),
          balance: parseFloat(balance),
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        },
      })

      giftCards.push(giftCard)
    }

    return NextResponse.json({ success: true, giftCards }, { status: 201 })
  } catch (error) {
    console.error('Gift card creation error:', error)
    return NextResponse.json({ error: 'Failed to create gift card' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Gift card ID required' }, { status: 400 })
    }

    await prisma.giftCard.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Gift card deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete gift card' }, { status: 500 })
  }
}

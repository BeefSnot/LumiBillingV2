import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.knowledgeBase.update({
      where: { id: params.id },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating views:', error)
    return NextResponse.json({ error: 'Failed to update views' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const where: any = { isPublished: true }
    if (category) where.category = category
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ]
    }

    const [articles, categories] = await Promise.all([
      prisma.knowledgeBase.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.knowledgeBase.findMany({
        where: { isPublished: true },
        select: { category: true },
        distinct: ['category'],
      }),
    ])

    return NextResponse.json({
      articles,
      categories: categories.map(c => c.category),
    })
  } catch (error) {
    console.error('Error fetching knowledge base:', error)
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
  }
}

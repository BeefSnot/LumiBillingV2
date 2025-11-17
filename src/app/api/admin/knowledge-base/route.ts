import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const articles = await prisma.knowledgeBase.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ articles })
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { title, slug, content, category, isPublished } = await request.json()

    const article = await prisma.knowledgeBase.create({
      data: {
        title,
        slug,
        content,
        category,
        isPublished,
      },
    })

    await createAuditLog({
      userId: user.id,
      userEmail: user.email,
      action: 'CREATE',
      entity: 'KNOWLEDGE_BASE',
      entityId: article.id,
      details: `Created knowledge base article: ${title}`,
    })

    return NextResponse.json({ article })
  } catch (error) {
    console.error('Error creating article:', error)
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Article ID required' }, { status: 400 })
    }

    const { title, slug, content, category, isPublished } = await request.json()

    const article = await prisma.knowledgeBase.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        category,
        isPublished,
      },
    })

    await createAuditLog({
      userId: user.id,
      userEmail: user.email,
      action: 'UPDATE',
      entity: 'KNOWLEDGE_BASE',
      entityId: article.id,
      details: `Updated knowledge base article: ${title}`,
    })

    return NextResponse.json({ article })
  } catch (error) {
    console.error('Error updating article:', error)
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Article ID required' }, { status: 400 })
    }

    const article = await prisma.knowledgeBase.delete({
      where: { id },
    })

    await createAuditLog({
      userId: user.id,
      userEmail: user.email,
      action: 'DELETE',
      entity: 'KNOWLEDGE_BASE',
      entityId: article.id,
      details: `Deleted knowledge base article: ${article.title}`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting article:', error)
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 })
  }
}

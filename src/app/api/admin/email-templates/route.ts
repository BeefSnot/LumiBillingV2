import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const templates = await prisma.emailTemplate.findMany({
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Email templates fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch email templates' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, subject, body, variables } = await req.json()

    if (!name || !subject || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const template = await prisma.emailTemplate.create({
      data: {
        name,
        subject,
        body,
        variables: variables || null,
        isActive: true,
      }
    })

    await createAuditLog({
      action: 'CREATE',
      entity: 'EMAIL_TEMPLATE',
      entityId: template.id,
      userId: session.user.id,
      userEmail: session.user.email,
      details: JSON.stringify({ templateName: name })
    })

    return NextResponse.json({ success: true, template })
  } catch (error) {
    console.error('Email template creation error:', error)
    return NextResponse.json({ error: 'Failed to create email template' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, name, subject, body, isActive } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'Template ID required' }, { status: 400 })
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (subject !== undefined) updateData.subject = subject
    if (body !== undefined) updateData.body = body
    if (isActive !== undefined) updateData.isActive = isActive

    const template = await prisma.emailTemplate.update({
      where: { id },
      data: updateData
    })

    await createAuditLog({
      action: 'UPDATE',
      entity: 'EMAIL_TEMPLATE',
      entityId: id,
      userId: session.user.id,
      userEmail: session.user.email,
      details: JSON.stringify({ templateName: template.name, changes: Object.keys(updateData) })
    })

    return NextResponse.json({ success: true, template })
  } catch (error) {
    console.error('Email template update error:', error)
    return NextResponse.json({ error: 'Failed to update email template' }, { status: 500 })
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
      return NextResponse.json({ error: 'Template ID required' }, { status: 400 })
    }

    const template = await prisma.emailTemplate.delete({
      where: { id }
    })

    await createAuditLog({
      action: 'DELETE',
      entity: 'EMAIL_TEMPLATE',
      entityId: id,
      userId: session.user.id,
      userEmail: session.user.email,
      details: JSON.stringify({ templateName: template.name })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email template deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete email template' }, { status: 500 })
  }
}

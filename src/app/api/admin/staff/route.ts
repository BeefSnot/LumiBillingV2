import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { createAuditLog } from '@/lib/audit'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const staff = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'STAFF']
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        roleId: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        staffRole: {
          select: {
            id: true,
            name: true,
            description: true,
            isActive: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ staff })
  } catch (error) {
    console.error('Staff fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email, firstName, lastName, password, role, roleId } = await req.json()

    if (!email || !firstName || !lastName || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (role === 'STAFF' && !roleId) {
      return NextResponse.json({ error: 'Staff members must have a role assigned' }, { status: 400 })
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email }
    })

    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create staff member
    const staff = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        password: hashedPassword,
        role: role as 'ADMIN' | 'STAFF',
        roleId: role === 'STAFF' ? roleId : null,
        isActive: true,
      },
      include: {
        staffRole: true
      }
    })

    // Log the action
    await createAuditLog({
      action: 'CREATE',
      entity: 'STAFF',
      entityId: staff.id,
      userId: session.user.id,
      userEmail: session.user.email,
      details: JSON.stringify({
        staffEmail: email,
        staffName: `${firstName} ${lastName}`,
        role,
        roleId
      })
    })

    return NextResponse.json({ success: true, staff })
  } catch (error) {
    console.error('Staff creation error:', error)
    return NextResponse.json({ error: 'Failed to create staff member' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, firstName, lastName, password, role, roleId, isActive } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'Staff ID required' }, { status: 400 })
    }

    // Build update data
    const updateData: any = {}
    if (firstName !== undefined) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName
    if (role !== undefined) {
      updateData.role = role
      updateData.roleId = role === 'STAFF' ? roleId : null
    }
    if (isActive !== undefined) updateData.isActive = isActive
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const staff = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        staffRole: true
      }
    })

    // Log the action
    await createAuditLog({
      action: 'UPDATE',
      entity: 'STAFF',
      entityId: id,
      userId: session.user.id,
      userEmail: session.user.email,
      details: JSON.stringify({
        staffEmail: staff.email,
        changes: Object.keys(updateData)
      })
    })

    return NextResponse.json({ success: true, staff })
  } catch (error) {
    console.error('Staff update error:', error)
    return NextResponse.json({ error: 'Failed to update staff member' }, { status: 500 })
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
      return NextResponse.json({ error: 'Staff ID required' }, { status: 400 })
    }

    // Don't allow deleting yourself
    if (id === session.user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    const staff = await prisma.user.findUnique({
      where: { id },
      select: { email: true, firstName: true, lastName: true }
    })

    await prisma.user.delete({
      where: { id }
    })

    // Log the action
    await createAuditLog({
      action: 'DELETE',
      entity: 'STAFF',
      entityId: id,
      userId: session.user.id,
      userEmail: session.user.email,
      details: JSON.stringify({
        staffEmail: staff?.email,
        staffName: `${staff?.firstName} ${staff?.lastName}`
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Staff deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete staff member' }, { status: 500 })
  }
}

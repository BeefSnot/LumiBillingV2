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

    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: { users: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Parse JSON permissions for each role
    const rolesWithParsedPermissions = roles.map(role => ({
      ...role,
      permissions: JSON.parse(role.permissions || '[]')
    }))

    return NextResponse.json({ roles: rolesWithParsedPermissions })
  } catch (error) {
    console.error('Roles fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, permissions } = await req.json()

    if (!name || !permissions) {
      return NextResponse.json({ error: 'Name and permissions are required' }, { status: 400 })
    }

    // Check if name already exists
    const existing = await prisma.role.findUnique({
      where: { name }
    })

    if (existing) {
      return NextResponse.json({ error: 'Role name already exists' }, { status: 400 })
    }

    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissions: JSON.stringify(permissions),
        isActive: true,
      },
      include: {
        _count: {
          select: { users: true }
        }
      }
    })

    // Parse permissions for response
    const roleWithParsedPermissions = {
      ...role,
      permissions: JSON.parse(role.permissions || '[]')
    }

    // Log the action
    await createAuditLog({
      action: 'CREATE',
      entity: 'ROLE',
      entityId: role.id,
      userId: session.user.id,
      userEmail: session.user.email,
      details: JSON.stringify({
        roleName: name,
        permissionCount: permissions.length
      })
    })

    return NextResponse.json({ success: true, role: roleWithParsedPermissions })
  } catch (error) {
    console.error('Role creation error:', error)
    return NextResponse.json({ error: 'Failed to create role' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, name, description, permissions, isActive } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'Role ID required' }, { status: 400 })
    }

    // Build update data
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (permissions !== undefined) updateData.permissions = JSON.stringify(permissions)
    if (isActive !== undefined) updateData.isActive = isActive

    const role = await prisma.role.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { users: true }
        }
      }
    })

    // Parse permissions for response
    const roleWithParsedPermissions = {
      ...role,
      permissions: JSON.parse(role.permissions || '[]')
    }

    // Log the action
    await createAuditLog({
      action: 'UPDATE',
      entity: 'ROLE',
      entityId: id,
      userId: session.user.id,
      userEmail: session.user.email,
      details: JSON.stringify({
        roleName: role.name,
        changes: Object.keys(updateData)
      })
    })

    return NextResponse.json({ success: true, role: roleWithParsedPermissions })
  } catch (error) {
    console.error('Role update error:', error)
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
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
      return NextResponse.json({ error: 'Role ID required' }, { status: 400 })
    }

    // Check if any staff members are using this role
    const usersWithRole = await prisma.user.count({
      where: { roleId: id }
    })

    if (usersWithRole > 0) {
      return NextResponse.json({ 
        error: `Cannot delete role. ${usersWithRole} staff member(s) are assigned to this role. Please reassign them first.` 
      }, { status: 400 })
    }

    const role = await prisma.role.findUnique({
      where: { id },
      select: { name: true }
    })

    await prisma.role.delete({
      where: { id }
    })

    // Log the action
    await createAuditLog({
      action: 'DELETE',
      entity: 'ROLE',
      entityId: id,
      userId: session.user.id,
      userEmail: session.user.email,
      details: JSON.stringify({
        roleName: role?.name
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Role deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 })
  }
}

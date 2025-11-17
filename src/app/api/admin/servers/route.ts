import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const servers = await prisma.server.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        hostname: true,
        ipAddress: true,
        type: true,
        apiUrl: true,
        maxAccounts: true,
        active: true,
        createdAt: true,
        _count: {
          select: {
            products: true,
          }
        }
      }
    })

    return NextResponse.json({ servers })
  } catch (error) {
    console.error('Error fetching servers:', error)
    return NextResponse.json({ error: 'Failed to fetch servers' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      hostname,
      ipAddress,
      type,
      apiUrl,
      username,
      password,
      apiKey,
      maxAccounts,
      active,
    } = body

    const server = await prisma.server.create({
      data: {
        name,
        hostname,
        ipAddress,
        type,
        apiUrl,
        username: username || null,
        password: password || null,
        apiKey: apiKey || null,
        maxAccounts: maxAccounts ? parseInt(maxAccounts) : null,
        active: active !== undefined ? active : true,
      },
    })

    return NextResponse.json({ server }, { status: 201 })
  } catch (error) {
    console.error('Error creating server:', error)
    return NextResponse.json({ error: 'Failed to create server' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      id,
      name,
      hostname,
      ipAddress,
      type,
      apiUrl,
      username,
      password,
      apiKey,
      maxAccounts,
      active,
    } = body

    const server = await prisma.server.update({
      where: { id },
      data: {
        name,
        hostname,
        ipAddress,
        type,
        apiUrl,
        username: username || null,
        password: password || null,
        apiKey: apiKey || null,
        maxAccounts: maxAccounts ? parseInt(maxAccounts) : null,
        active,
      },
    })

    return NextResponse.json({ server })
  } catch (error) {
    console.error('Error updating server:', error)
    return NextResponse.json({ error: 'Failed to update server' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Server ID required' }, { status: 400 })
    }

    await prisma.server.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting server:', error)
    return NextResponse.json({ error: 'Failed to delete server' }, { status: 500 })
  }
}

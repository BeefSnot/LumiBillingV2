import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Get all products
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        server: {
          select: {
            name: true,
            hostname: true,
          }
        },
        _count: {
          select: {
            services: true,
          }
        }
      }
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Products fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// Create product
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      name,
      description,
      type,
      price,
      billingCycle,
      setupFee,
      serverId,
      diskSpace,
      bandwidth,
      ram,
      cpu,
      active
    } = await req.json()

    if (!name || !type || price === undefined || !billingCycle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        type,
        price: parseFloat(price),
        billingCycle,
        setupFee: setupFee ? parseFloat(setupFee) : 0,
        serverId: serverId || null,
        diskSpace: diskSpace ? parseInt(diskSpace) : null,
        bandwidth: bandwidth ? parseInt(bandwidth) : null,
        ram: ram ? parseInt(ram) : null,
        cpu: cpu ? parseInt(cpu) : null,
        active: active !== undefined ? active : true,
      }
    })

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Product creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}

// Update product
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      id,
      name,
      description,
      type,
      price,
      billingCycle,
      setupFee,
      serverId,
      diskSpace,
      bandwidth,
      ram,
      cpu,
      active
    } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description !== undefined ? description : undefined,
        type: type || undefined,
        price: price !== undefined ? parseFloat(price) : undefined,
        billingCycle: billingCycle || undefined,
        setupFee: setupFee !== undefined ? parseFloat(setupFee) : undefined,
        serverId: serverId !== undefined ? serverId : undefined,
        diskSpace: diskSpace !== undefined ? (diskSpace ? parseInt(diskSpace) : null) : undefined,
        bandwidth: bandwidth !== undefined ? (bandwidth ? parseInt(bandwidth) : null) : undefined,
        ram: ram !== undefined ? (ram ? parseInt(ram) : null) : undefined,
        cpu: cpu !== undefined ? (cpu ? parseInt(cpu) : null) : undefined,
        active: active !== undefined ? active : undefined,
      }
    })

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Product update error:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// Delete product
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    await prisma.product.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Product deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}

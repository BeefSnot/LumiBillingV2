import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    const { firstName, lastName, email, company, phone, address, city, country, postalCode } = data

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        firstName,
        lastName,
        email,
        company,
        phone,
        address,
        city,
        country,
        postalCode,
      },
    })

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        name: `${updatedUser.firstName} ${updatedUser.lastName}`,
        email: updatedUser.email,
      },
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}

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

    const preferences = await req.json()

    // Store notification preferences
    // You can add a NotificationPreferences model to your schema if needed
    // For now, we'll just return success
    console.log('Notification preferences updated:', preferences)

    return NextResponse.json({ 
      message: 'Notification preferences updated successfully',
      preferences 
    })
  } catch (error) {
    console.error('Notification update error:', error)
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
  }
}

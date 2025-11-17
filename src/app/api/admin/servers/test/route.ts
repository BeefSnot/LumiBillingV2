import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DirectAdminClient } from '@/lib/integrations/directadmin'
import { VirtfusionClient } from '@/lib/integrations/virtfusion'
import { PterodactylClient } from '@/lib/integrations/pterodactyl'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, apiUrl, username, password, apiKey, apiVersion } = await req.json()

    if (!type || !apiUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let result: { success: boolean; message: string }

    switch (type) {
      case 'DIRECTADMIN':
        if (!username || !password) {
          return NextResponse.json({ error: 'Username and password required for DirectAdmin' }, { status: 400 })
        }
        const apiVersionFinal = apiVersion === 'v1' ? 'v1' : 'v2'
        const daClient = new DirectAdminClient({ 
          apiUrl, 
          username, 
          password,
          apiVersion: apiVersionFinal
        })
        result = await daClient.testConnection()
        break

      case 'VIRTFUSION':
        if (!apiKey) {
          return NextResponse.json({ error: 'API key required for VirtFusion' }, { status: 400 })
        }
        const vfClient = new VirtfusionClient({ apiUrl, apiKey })
        result = await vfClient.testConnection()
        break

      case 'PTERODACTYL':
        if (!apiKey) {
          return NextResponse.json({ error: 'API key required for Pterodactyl' }, { status: 400 })
        }
        const ptClient = new PterodactylClient({ apiUrl, apiKey })
        result = await ptClient.testConnection()
        break

      default:
        return NextResponse.json({ error: 'Invalid server type' }, { status: 400 })
    }

    if (result.success) {
      return NextResponse.json({ success: true, message: result.message })
    } else {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Connection test error:', error)
    return NextResponse.json(
      { error: error.message || 'Connection test failed' },
      { status: 500 }
    )
  }
}

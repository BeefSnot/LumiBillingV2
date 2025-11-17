import { prisma } from '../prisma'
import { DirectAdminClient } from '../integrations/directadmin'
import { VirtfusionClient } from '../integrations/virtfusion'
import { PterodactylClient } from '../integrations/pterodactyl'
import { createAuditLog } from '../audit'

export class ProvisioningService {
  async provisionService(serviceId: string) {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        product: {
          include: {
            server: true
          }
        },
        user: true
      }
    })

    if (!service || !service.product.server) {
      throw new Error('Service or server not found')
    }

    const provision = await prisma.provision.create({
      data: {
        serviceId,
        status: 'PROCESSING'
      }
    })

    try {
      let result

      switch (service.product.server.type) {
        case 'DIRECTADMIN':
          result = await this.provisionDirectAdmin(service)
          break
        case 'VIRTFUSION':
          result = await this.provisionVirtfusion(service)
          break
        case 'PTERODACTYL':
          result = await this.provisionPterodactyl(service)
          break
        default:
          throw new Error('Unsupported server type')
      }

      await prisma.provision.update({
        where: { id: provision.id },
        data: {
          status: 'COMPLETED',
          data: JSON.stringify(result)
        }
      })

      await prisma.service.update({
        where: { id: serviceId },
        data: {
          status: 'ACTIVE'
        }
      })

      // Log audit event
      await createAuditLog({
        userId: service.userId,
        userEmail: service.user.email,
        action: 'SERVICE_PROVISIONED',
        entity: 'Service',
        entityId: serviceId,
        details: JSON.stringify({
          productName: service.product.name,
          serverType: service.product.server.type,
          result
        })
      })

      return result
    } catch (error: any) {
      await prisma.provision.update({
        where: { id: provision.id },
        data: {
          status: 'FAILED',
          error: error.message,
          attempts: provision.attempts + 1
        }
      })

      // Log failed provision
      await createAuditLog({
        userId: service.userId,
        userEmail: service.user.email,
        action: 'SERVICE_PROVISION_FAILED',
        entity: 'Service',
        entityId: serviceId,
        details: JSON.stringify({
          productName: service.product.name,
          serverType: service.product.server.type,
          error: error.message
        })
      })

      throw error
    }
  }

  async suspendService(serviceId: string) {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        product: { include: { server: true } },
        user: true
      }
    })

    if (!service || !service.product.server) {
      throw new Error('Service or server not found')
    }

    try {
      switch (service.product.server.type) {
        case 'DIRECTADMIN':
          const apiVersion = service.product.server.apiVersion === 'v1' ? 'v1' : 'v2'
          const daClient = new DirectAdminClient({
            apiUrl: service.product.server.apiUrl,
            username: service.product.server.username || '',
            password: service.product.server.password || '',
            apiVersion,
          })
          if (service.username) {
            await daClient.suspendAccount(service.username)
          }
          break
        case 'VIRTFUSION':
          const vfClient = new VirtfusionClient({
            apiUrl: service.product.server.apiUrl,
            apiKey: service.product.server.apiKey || ''
          })
          const vfServerId = parseInt(service.externalId || '0')
          if (vfServerId) {
            await vfClient.suspendServer(vfServerId)
          }
          break
        case 'PTERODACTYL':
          const ptClient = new PterodactylClient({
            apiUrl: service.product.server.apiUrl,
            apiKey: service.product.server.apiKey || ''
          })
          const ptServerId = parseInt(service.externalId || '0')
          if (ptServerId) {
            await ptClient.suspendServer(ptServerId)
          }
          break
      }

      await prisma.service.update({
        where: { id: serviceId },
        data: { status: 'SUSPENDED' }
      })

      await createAuditLog({
        userId: service.userId,
        userEmail: service.user.email,
        action: 'SERVICE_SUSPENDED',
        entity: 'Service',
        entityId: serviceId,
        details: JSON.stringify({
          productName: service.product.name,
          serverType: service.product.server.type
        })
      })
    } catch (error: any) {
      console.error('Failed to suspend service:', error)
      throw error
    }
  }

  async unsuspendService(serviceId: string) {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        product: { include: { server: true } },
        user: true
      }
    })

    if (!service || !service.product.server) {
      throw new Error('Service or server not found')
    }

    try {
      switch (service.product.server.type) {
        case 'DIRECTADMIN':
          const apiVersion = service.product.server.apiVersion === 'v1' ? 'v1' : 'v2'
          const daClient = new DirectAdminClient({
            apiUrl: service.product.server.apiUrl,
            username: service.product.server.username || '',
            password: service.product.server.password || '',
            apiVersion,
          })
          if (service.username) {
            await daClient.unsuspendAccount(service.username)
          }
          break
        case 'VIRTFUSION':
          const vfClient = new VirtfusionClient({
            apiUrl: service.product.server.apiUrl,
            apiKey: service.product.server.apiKey || ''
          })
          const vfServerId = parseInt(service.externalId || '0')
          if (vfServerId) {
            await vfClient.unsuspendServer(vfServerId)
          }
          break
        case 'PTERODACTYL':
          const ptClient = new PterodactylClient({
            apiUrl: service.product.server.apiUrl,
            apiKey: service.product.server.apiKey || ''
          })
          const ptServerId = parseInt(service.externalId || '0')
          if (ptServerId) {
            await ptClient.unsuspendServer(ptServerId)
          }
          break
      }

      await prisma.service.update({
        where: { id: serviceId },
        data: { status: 'ACTIVE' }
      })

      await createAuditLog({
        userId: service.userId,
        userEmail: service.user.email,
        action: 'SERVICE_UNSUSPENDED',
        entity: 'Service',
        entityId: serviceId,
        details: JSON.stringify({
          productName: service.product.name,
          serverType: service.product.server.type
        })
      })
    } catch (error: any) {
      console.error('Failed to unsuspend service:', error)
      throw error
    }
  }

  async terminateService(serviceId: string) {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        product: { include: { server: true } },
        user: true
      }
    })

    if (!service || !service.product.server) {
      throw new Error('Service or server not found')
    }

    try {
      switch (service.product.server.type) {
        case 'DIRECTADMIN':
          const daClient = new DirectAdminClient({
            apiUrl: service.product.server.apiUrl,
            username: service.product.server.username || '',
            password: service.product.server.password || '',
            apiVersion: service.product.server.apiVersion || 'v2'
          })
          if (service.username) {
            await daClient.deleteAccount(service.username)
          }
          break
        case 'VIRTFUSION':
          const vfClient = new VirtfusionClient({
            apiUrl: service.product.server.apiUrl,
            apiKey: service.product.server.apiKey || ''
          })
          const vfServerId = parseInt(service.externalId || '0')
          if (vfServerId) {
            await vfClient.terminateServer(vfServerId)
          }
          break
        case 'PTERODACTYL':
          const ptClient = new PterodactylClient({
            apiUrl: service.product.server.apiUrl,
            apiKey: service.product.server.apiKey || ''
          })
          const ptServerId = parseInt(service.externalId || '0')
          if (ptServerId) {
            await ptClient.deleteServer(ptServerId, true)
          }
          break
      }

      await prisma.service.update({
        where: { id: serviceId },
        data: { status: 'TERMINATED' }
      })

      await createAuditLog({
        userId: service.userId,
        userEmail: service.user.email,
        action: 'SERVICE_TERMINATED',
        entity: 'Service',
        entityId: serviceId,
        details: JSON.stringify({
          productName: service.product.name,
          serverType: service.product.server.type
        })
      })
    } catch (error: any) {
      console.error('Failed to terminate service:', error)
      throw error
    }
  }

  private async provisionDirectAdmin(service: any) {
    const server = service.product.server
    const apiVersion = server.apiVersion === 'v1' ? 'v1' : 'v2'
    const client = new DirectAdminClient({
      apiUrl: server.apiUrl,
      username: server.username || '',
      password: server.password || '',
      apiVersion,
    })
    const username = service.username || `user_${Date.now()}`
    const password = service.password || this.generatePassword()

    await client.createAccount(
      username,
      service.user.email,
      password,
      service.domain || `${username}.example.com`,
      'default'
    )

    await prisma.service.update({
      where: { id: service.id },
      data: {
        username,
        password
      }
    })

    return { username, password, domain: service.domain }
  }

  private async provisionVirtfusion(service: any) {
    const serverConfig = service.product.server
    const client = new VirtfusionClient({
      apiUrl: serverConfig.apiUrl,
      apiKey: serverConfig.apiKey || ''
    })
    const hostname = service.domain || `vps-${Date.now()}.example.com`
    const password = service.password || this.generatePassword()

    const result = await client.createServer({
      package_id: 1, // You'll need to configure this
      hostname,
      password,
      ipv4: 1,
      ipv6: 0
    })

    // Attempt to save the provider's server id to the service.externalId if returned
    const vfId = result?.id || result?.data?.id || result?.server_id || result?.server?.id
    await prisma.service.update({
      where: { id: service.id },
      data: {
        username: 'root',
        password,
        externalId: vfId ? String(vfId) : undefined
      }
    })

    return result
  }

  private async provisionPterodactyl(service: any) {
    const serverConfig = service.product.server
    const client = new PterodactylClient({
      apiUrl: serverConfig.apiUrl,
      apiKey: serverConfig.apiKey || ''
    })

    // Create user first
    const user = await client.createUser(
      service.user.email,
      service.username || `user_${Date.now()}`,
      service.user.firstName,
      service.user.lastName
    )

    // Create server
    const createdServer = await client.createServer({
      name: service.domain || `server-${Date.now()}`,
      user_id: user.attributes.id,
      egg: 1, // You'll need to configure this
      docker_image: 'quay.io/pterodactyl/core:java',
      startup: 'java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}',
      environment: {},
      limits: {
        memory: 1024,
        swap: 0,
        disk: 5000,
        io: 500,
        cpu: 100
      },
      feature_limits: {
        databases: 1,
        allocations: 1,
        backups: 1
      },
      allocation: {
        default: 1 // You'll need to configure this
      }
    })

    // Save the Pterodactyl server id if returned
    const ptId = createdServer?.attributes?.id || createdServer?.data?.id || createdServer?.id
    await prisma.service.update({
      where: { id: service.id },
      data: {
        username: user.attributes.username,
        externalId: ptId ? String(ptId) : undefined
      }
    })

    return createdServer
  }

  private generatePassword(): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 16; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    return password
  }
}

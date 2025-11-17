import axios from 'axios'

interface VirtfusionConfig {
  apiUrl: string
  apiKey: string
}

export class VirtfusionClient {
  private baseURL: string
  private apiKey: string

  constructor(config?: VirtfusionConfig) {
    if (config) {
      this.baseURL = config.apiUrl
      this.apiKey = config.apiKey
    } else {
      this.baseURL = process.env.VIRTFUSION_URL || ''
      this.apiKey = process.env.VIRTFUSION_API_KEY || ''
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      await this.request('/user', 'GET')
      return { success: true, message: 'Connection successful' }
    } catch (error: any) {
      return { success: false, message: error.message || 'Connection failed' }
    }
  }

  private async request(endpoint: string, method: string = 'GET', data?: any) {
    try {
      const response = await axios({
        method,
        url: `${this.baseURL}/api${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        data,
      })
      return response.data
    } catch (error) {
      console.error('Virtfusion API Error:', error)
      throw error
    }
  }

  async createServer(params: {
    package_id: number
    hostname: string
    password: string
    ipv4?: number
    ipv6?: number
  }) {
    return this.request('/servers', 'POST', params)
  }

  async getServer(serverId: number) {
    return this.request(`/servers/${serverId}`)
  }

  async suspendServer(serverId: number) {
    return this.request(`/servers/${serverId}/suspend`, 'POST')
  }

  async unsuspendServer(serverId: number) {
    return this.request(`/servers/${serverId}/unsuspend`, 'POST')
  }

  async terminateServer(serverId: number) {
    return this.request(`/servers/${serverId}`, 'DELETE')
  }

  async rebootServer(serverId: number) {
    return this.request(`/servers/${serverId}/reboot`, 'POST')
  }

  async changePassword(serverId: number, password: string) {
    return this.request(`/servers/${serverId}/password`, 'POST', { password })
  }

  async startServer(serverId: number) {
    return this.request(`/servers/${serverId}/start`, 'POST')
  }

  async stopServer(serverId: number) {
    return this.request(`/servers/${serverId}/stop`, 'POST')
  }

  async shutdownServer(serverId: number) {
    return this.request(`/servers/${serverId}/shutdown`, 'POST')
  }

  async reinstallServer(serverId: number, operatingSystemId: number) {
    return this.request(`/servers/${serverId}/reinstall`, 'POST', {
      operating_system_id: operatingSystemId
    })
  }

  async listServers() {
    return this.request('/servers', 'GET')
  }

  async getPackages() {
    return this.request('/packages', 'GET')
  }

  async getServerStats(serverId: number) {
    return this.request(`/servers/${serverId}/stats`, 'GET')
  }

  async resizeServer(serverId: number, packageId: number) {
    return this.request(`/servers/${serverId}/resize`, 'POST', {
      package_id: packageId
    })
  }

  async getConsoleUrl(serverId: number) {
    return this.request(`/servers/${serverId}/console`, 'GET')
  }

  async mountISO(serverId: number, isoId: number) {
    return this.request(`/servers/${serverId}/iso`, 'POST', {
      iso_id: isoId
    })
  }

  async unmountISO(serverId: number) {
    return this.request(`/servers/${serverId}/iso`, 'DELETE')
  }
}

// Factory function
export async function createVirtfusionClient(config?: VirtfusionConfig): Promise<VirtfusionClient> {
  return new VirtfusionClient(config)
}

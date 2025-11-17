import axios from 'axios'

interface PterodactylConfig {
  apiUrl: string
  apiKey: string
}

export class PterodactylClient {
  private baseURL: string
  private apiKey: string

  constructor(config?: PterodactylConfig) {
    if (config) {
      this.baseURL = config.apiUrl
      this.apiKey = config.apiKey
    } else {
      this.baseURL = process.env.PTERODACTYL_URL || ''
      this.apiKey = process.env.PTERODACTYL_API_KEY || ''
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      await this.request('/nodes', 'GET')
      return { success: true, message: 'Connection successful' }
    } catch (error: any) {
      return { success: false, message: error.message || 'Connection failed' }
    }
  }

  private async request(endpoint: string, method: string = 'GET', data?: any) {
    try {
      const response = await axios({
        method,
        url: `${this.baseURL}/api/application${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        data,
      })
      return response.data
    } catch (error) {
      console.error('Pterodactyl API Error:', error)
      throw error
    }
  }

  async createUser(email: string, username: string, firstName: string, lastName: string) {
    return this.request('/users', 'POST', {
      email,
      username,
      first_name: firstName,
      last_name: lastName,
    })
  }

  async createServer(params: {
    name: string
    user_id: number
    egg: number
    docker_image: string
    startup: string
    environment: Record<string, any>
    limits: {
      memory: number
      swap: number
      disk: number
      io: number
      cpu: number
    }
    feature_limits: {
      databases: number
      allocations: number
      backups: number
    }
    allocation: {
      default: number
    }
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

  async deleteServer(serverId: number, force: boolean = false) {
    return this.request(`/servers/${serverId}${force ? '/force' : ''}`, 'DELETE')
  }

  async reinstallServer(serverId: number) {
    return this.request(`/servers/${serverId}/reinstall`, 'POST')
  }

  async updateServerBuild(serverId: number, resources: {
    memory?: number
    disk?: number
    cpu?: number
    swap?: number
    io?: number
  }) {
    return this.request(`/servers/${serverId}/build`, 'PATCH', {
      limits: {
        memory: resources.memory,
        swap: resources.swap ?? 0,
        disk: resources.disk,
        io: resources.io ?? 500,
        cpu: resources.cpu,
      }
    })
  }

  async listServers(page: number = 1) {
    return this.request(`/servers?page=${page}`)
  }

  async getLocations() {
    return this.request('/locations')
  }

  async getEggs(nestId: number) {
    return this.request(`/nests/${nestId}/eggs`)
  }

  async getNests() {
    return this.request('/nests')
  }
}

// Factory function
export async function createPterodactylClient(config?: PterodactylConfig): Promise<PterodactylClient> {
  return new PterodactylClient(config)
}

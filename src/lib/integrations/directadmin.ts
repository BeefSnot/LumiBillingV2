import axios from 'axios'

interface DirectAdminConfig {
  apiUrl: string
  username: string
  password: string
  apiVersion?: 'v1' | 'v2' // Support both API versions
}

export class DirectAdminClient {
  private baseURL: string
  private username: string
  private password: string
  private apiVersion: 'v1' | 'v2'

  constructor(config?: DirectAdminConfig) {
    if (config) {
      this.baseURL = config.apiUrl
      this.username = config.username
      this.password = config.password
      this.apiVersion = config.apiVersion || 'v2' // Default to v2
    } else {
      this.baseURL = process.env.DIRECTADMIN_URL || ''
      this.username = process.env.DIRECTADMIN_USERNAME || ''
      this.password = process.env.DIRECTADMIN_PASSWORD || ''
      this.apiVersion = (process.env.DIRECTADMIN_API_VERSION as 'v1' | 'v2') || 'v2'
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (this.apiVersion === 'v2') {
        // API v2 uses /api/
        await this.request('/api/account-info', 'GET')
      } else {
        // API v1 uses /CMD_API_
        await this.request('/CMD_API_SHOW_USER_CONFIG', 'GET')
      }
      return { success: true, message: `Connection successful (API ${this.apiVersion})` }
    } catch (error: any) {
      return { success: false, message: error.message || 'Connection failed' }
    }
  }

  private async request(endpoint: string, method: string = 'GET', data?: any) {
    try {
      const config: any = {
        method,
        url: `${this.baseURL}${endpoint}`,
        auth: {
          username: this.username,
          password: this.password,
        },
      }

      if (this.apiVersion === 'v2') {
        // API v2 uses JSON
        config.headers = {
          'Content-Type': 'application/json',
        }
        if (data) config.data = data
      } else {
        // API v1 uses form data
        if (data) {
          const params = new URLSearchParams(data)
          config.data = params
          config.headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        }
      }

      const response = await axios(config)
      return response.data
    } catch (error: any) {
      console.error('DirectAdmin API Error:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || error.message || 'DirectAdmin API request failed')
    }
  }

  async createAccount(username: string, email: string, password: string, domain: string, package_name: string = 'default') {
    if (this.apiVersion === 'v2') {
      // API v2 endpoint
      return this.request('/api/users', 'POST', {
        username,
        email,
        password,
        domain,
        package: package_name,
        ip: 'shared',
        notify: false,
      })
    } else {
      // API v1 endpoint
      return this.request('/CMD_API_ACCOUNT_USER', 'POST', {
        action: 'create',
        username,
        email,
        passwd: password,
        passwd2: password,
        domain,
        package: package_name,
        ip: 'shared',
        notify: 'no',
      })
    }
  }

  async suspendAccount(username: string) {
    if (this.apiVersion === 'v2') {
      return this.request(`/api/users/${username}/suspend`, 'POST', {})
    } else {
      return this.request('/CMD_API_SELECT_USERS', 'POST', {
        location: 'CMD_SELECT_USERS',
        suspend: 'Suspend',
        select0: username,
      })
    }
  }

  async unsuspendAccount(username: string) {
    if (this.apiVersion === 'v2') {
      return this.request(`/api/users/${username}/unsuspend`, 'POST', {})
    } else {
      return this.request('/CMD_API_SELECT_USERS', 'POST', {
        location: 'CMD_SELECT_USERS',
        unsuspend: 'Unsuspend',
        select0: username,
      })
    }
  }

  async deleteAccount(username: string) {
    if (this.apiVersion === 'v2') {
      return this.request(`/api/users/${username}`, 'DELETE', {})
    } else {
      return this.request('/CMD_API_SELECT_USERS', 'POST', {
        confirmed: 'Confirm',
        delete: 'yes',
        select0: username,
      })
    }
  }

  async changePassword(username: string, newPassword: string) {
    if (this.apiVersion === 'v2') {
      return this.request(`/api/users/${username}/password`, 'PUT', {
        password: newPassword,
      })
    } else {
      return this.request('/CMD_API_USER_PASSWD', 'POST', {
        username,
        passwd: newPassword,
        passwd2: newPassword,
      })
    }
  }

  async getPackages() {
    if (this.apiVersion === 'v2') {
      return this.request('/api/packages', 'GET')
    } else {
      return this.request('/CMD_API_PACKAGES_USER', 'GET')
    }
  }

  async getAccountInfo(username: string) {
    if (this.apiVersion === 'v2') {
      return this.request(`/api/users/${username}`, 'GET')
    } else {
      return this.request(`/CMD_API_SHOW_USER_CONFIG?user=${username}`, 'GET')
    }
  }

  async changePackage(username: string, package_name: string) {
    if (this.apiVersion === 'v2') {
      return this.request(`/api/users/${username}/package`, 'PUT', {
        package: package_name,
      })
    } else {
      return this.request('/CMD_API_MODIFY_USER', 'POST', {
        user: username,
        package: package_name,
      })
    }
  }

  async listAccounts() {
    if (this.apiVersion === 'v2') {
      return this.request('/api/users', 'GET')
    } else {
      return this.request('/CMD_API_SHOW_ALL_USERS', 'GET')
    }
  }

  async getDomains(username: string) {
    if (this.apiVersion === 'v2') {
      return this.request(`/api/users/${username}/domains`, 'GET')
    } else {
      return this.request(`/CMD_API_SHOW_DOMAINS?user=${username}`, 'GET')
    }
  }

  async createDatabase(username: string, dbName: string, dbUser: string, dbPassword: string) {
    if (this.apiVersion === 'v2') {
      return this.request('/api/databases', 'POST', {
        name: dbName,
        user: dbUser,
        password: dbPassword,
      })
    } else {
      return this.request('/CMD_API_DATABASES', 'POST', {
        action: 'create',
        name: dbName,
        user: dbUser,
        passwd: dbPassword,
        passwd2: dbPassword,
      })
    }
  }
}

// Factory function
export async function createDirectAdminClient(config?: DirectAdminConfig): Promise<DirectAdminClient> {
  return new DirectAdminClient(config)
}

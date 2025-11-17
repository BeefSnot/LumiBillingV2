'use client'

import { useState, useEffect } from 'react'

interface Permission {
  id: string
  module: string
  action: string
  description: string
}

interface Role {
  id: string
  name: string
  description: string | null
  permissions: string[]
  isActive: boolean
  _count: {
    users: number
  }
}

const MODULES = [
  { name: 'Clients', value: 'clients', icon: '👤' },
  { name: 'Invoices', value: 'invoices', icon: '📄' },
  { name: 'Services', value: 'services', icon: '🚀' },
  { name: 'Products', value: 'products', icon: '📦' },
  { name: 'Tickets', value: 'tickets', icon: '🎫' },
  { name: 'Servers', value: 'servers', icon: '🖥️' },
  { name: 'Reports', value: 'reports', icon: '📊' },
  { name: 'Settings', value: 'settings', icon: '⚙️' },
]

const ACTIONS = [
  { name: 'View', value: 'view', color: 'blue' },
  { name: 'Create', value: 'create', color: 'green' },
  { name: 'Edit', value: 'edit', color: 'yellow' },
  { name: 'Delete', value: 'delete', color: 'red' },
]

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [rolesRes, permsRes] = await Promise.all([
        fetch('/api/admin/roles'),
        fetch('/api/admin/permissions')
      ])
      const rolesData = await rolesRes.json()
      const permsData = await permsRes.json()
      setRoles(rolesData.roles || [])
      setPermissions(permsData.permissions || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = '/api/admin/roles'
      const method = editingRole ? 'PUT' : 'POST'
      const body = editingRole 
        ? { id: editingRole.id, ...formData }
        : formData

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setShowCreateModal(false)
        setEditingRole(null)
        setFormData({ name: '', description: '', permissions: [] })
        fetchData()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to save role')
      }
    } catch (error) {
      console.error('Error saving role:', error)
      alert('Failed to save role')
    }
  }

  const handleEdit = (role: Role) => {
    setEditingRole(role)
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions,
    })
    setShowCreateModal(true)
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !isActive }),
      })

      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error toggling active status:', error)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the "${name}" role? This action cannot be undone.`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/roles?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchData()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete role')
      }
    } catch (error) {
      console.error('Error deleting role:', error)
      alert('Failed to delete role')
    }
  }

  const togglePermission = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }))
  }

  const toggleModule = (module: string) => {
    const modulePermissions = permissions
      .filter(p => p.module === module)
      .map(p => p.id)
    
    const allSelected = modulePermissions.every(p => formData.permissions.includes(p))
    
    if (allSelected) {
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => !modulePermissions.includes(p))
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...modulePermissions])]
      }))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="mt-2 text-gray-600">Define custom roles with granular permissions</p>
        </div>
        <button
          onClick={() => {
            setEditingRole(null)
            setFormData({ name: '', description: '', permissions: [] })
            setShowCreateModal(true)
          }}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition shadow-lg"
        >
          + Create Role
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Roles</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{roles.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl">
              🔐
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Roles</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {roles.filter(r => r.isActive).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white text-xl">
              ✓
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Staff Assigned</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {roles.reduce((sum, r) => sum + r._count.users, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-xl">
              👥
            </div>
          </div>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => {
          const permissionCount = role.permissions.length
          const moduleCount = [...new Set(
            permissions.filter(p => role.permissions.includes(p.id)).map(p => p.module)
          )].length

          return (
            <div key={role.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{role.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {role.description || 'No description'}
                  </p>
                </div>
                <button
                  onClick={() => handleToggleActive(role.id, role.isActive)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full flex-shrink-0 ml-2 ${
                    role.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {role.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Permissions</span>
                  <span className="font-semibold text-purple-600">{permissionCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Modules</span>
                  <span className="font-semibold text-blue-600">{moduleCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Staff Assigned</span>
                  <span className="font-semibold text-green-600">{role._count.users}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(role)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                >
                  Edit Role
                </button>
                <button
                  onClick={() => handleDelete(role.id, role.name)}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition font-medium text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingRole ? 'Edit Role' : 'Create Role'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Support Agent, Billing Manager"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={2}
                  placeholder="Brief description of this role's responsibilities"
                />
              </div>

              {/* Permission Matrix */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Permissions
                </label>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Module
                          </th>
                          {ACTIONS.map((action) => (
                            <th key={action.value} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {action.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {MODULES.map((module) => {
                          const modulePerms = permissions.filter(p => p.module === module.value)
                          const allSelected = modulePerms.every(p => formData.permissions.includes(p.id))
                          
                          return (
                            <tr key={module.value} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => toggleModule(module.value)}
                                  className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-purple-600"
                                >
                                  <span>{module.icon}</span>
                                  <span>{module.name}</span>
                                  {allSelected && <span className="text-purple-600">✓</span>}
                                </button>
                              </td>
                              {ACTIONS.map((action) => {
                                const perm = modulePerms.find(p => p.action === action.value)
                                if (!perm) return <td key={action.value} className="px-4 py-3"></td>
                                
                                const isChecked = formData.permissions.includes(perm.id)
                                
                                return (
                                  <td key={action.value} className="px-4 py-3 text-center">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => togglePermission(perm.id)}
                                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                    />
                                  </td>
                                )
                              })}
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Selected: {formData.permissions.length} permissions
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingRole(null)
                    setFormData({ name: '', description: '', permissions: [] })
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition"
                >
                  {editingRole ? 'Save Changes' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

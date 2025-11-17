'use client'

import { useState, useEffect } from 'react'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  type: string
  isActive: boolean
  updatedAt: string
}

const TEMPLATE_TYPES = [
  { value: 'WELCOME', label: 'Welcome Email', icon: '👋' },
  { value: 'INVOICE_CREATED', label: 'Invoice Created', icon: '📄' },
  { value: 'INVOICE_PAID', label: 'Invoice Paid', icon: '✅' },
  { value: 'INVOICE_OVERDUE', label: 'Invoice Overdue', icon: '⚠️' },
  { value: 'SERVICE_ACTIVATED', label: 'Service Activated', icon: '🚀' },
  { value: 'SERVICE_SUSPENDED', label: 'Service Suspended', icon: '⏸️' },
  { value: 'SERVICE_CANCELLED', label: 'Service Cancelled', icon: '❌' },
  { value: 'TICKET_REPLY', label: 'Ticket Reply', icon: '💬' },
  { value: 'PASSWORD_RESET', label: 'Password Reset', icon: '🔑' },
  { value: 'EMAIL_VERIFICATION', label: 'Email Verification', icon: '✉️' },
]

const VARIABLES = [
  { name: '{client_name}', desc: 'Client full name' },
  { name: '{client_email}', desc: 'Client email address' },
  { name: '{company_name}', desc: 'Your company name' },
  { name: '{invoice_number}', desc: 'Invoice number' },
  { name: '{invoice_total}', desc: 'Invoice total amount' },
  { name: '{invoice_due_date}', desc: 'Invoice due date' },
  { name: '{service_name}', desc: 'Service/product name' },
  { name: '{ticket_subject}', desc: 'Ticket subject' },
  { name: '{ticket_url}', desc: 'Link to ticket' },
]

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    type: 'WELCOME',
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/admin/email-templates')
      const data = await res.json()
      setTemplates(data.templates || [])
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingTemplate 
        ? '/api/admin/email-templates' 
        : '/api/admin/email-templates'
      const method = editingTemplate ? 'PUT' : 'POST'
      const body = editingTemplate
        ? { id: editingTemplate.id, ...formData }
        : formData

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setShowEditor(false)
        setEditingTemplate(null)
        setFormData({ name: '', subject: '', body: '', type: 'WELCOME' })
        fetchTemplates()
      } else {
        alert('Failed to save template')
      }
    } catch (error) {
      console.error('Error saving template:', error)
      alert('Failed to save template')
    }
  }

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
      type: template.type,
    })
    setShowEditor(true)
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch('/api/admin/email-templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !isActive }),
      })
      fetchTemplates()
    } catch (error) {
      console.error('Error toggling template:', error)
    }
  }

  const insertVariable = (variable: string) => {
    const textarea = document.querySelector('textarea[name="body"]') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = formData.body
      const newText = text.substring(0, start) + variable + text.substring(end)
      setFormData({ ...formData, body: newText })
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + variable.length, start + variable.length)
      }, 0)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
    </div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📧 Email Templates</h1>
          <p className="mt-2 text-gray-600">Customize automated email messages sent to clients</p>
        </div>
        <button
          onClick={() => {
            setEditingTemplate(null)
            setFormData({ name: '', subject: '', body: '', type: 'WELCOME' })
            setShowEditor(true)
          }}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-lg"
        >
          + Create Template
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEMPLATE_TYPES.map((type) => {
          const template = templates.find(t => t.type === type.value)
          const hasTemplate = !!template

          return (
            <div key={type.value} className={`rounded-2xl shadow-lg border-2 p-6 transition ${
              hasTemplate 
                ? 'bg-white border-blue-200 hover:shadow-xl' 
                : 'bg-gray-50 border-gray-200 hover:border-gray-300'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="text-3xl mb-2">{type.icon}</div>
                  <h3 className="text-lg font-bold text-gray-900">{type.label}</h3>
                  <p className="text-sm text-gray-500 mt-1">{type.value}</p>
                </div>
                {template && (
                  <button
                    onClick={() => handleToggleActive(template.id, template.isActive)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      template.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {template.isActive ? 'Active' : 'Inactive'}
                  </button>
                )}
              </div>

              {template ? (
                <>
                  <div className="space-y-2 mb-4">
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                      <p className="text-xs font-semibold text-blue-600 mb-1">Subject</p>
                      <p className="text-sm text-blue-900 font-medium">{template.subject}</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      Last updated: {new Date(template.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleEdit(template)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Edit Template
                  </button>
                </>
              ) : (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-3">No template configured</p>
                  <button
                    onClick={() => {
                      setEditingTemplate(null)
                      setFormData({ name: type.label, subject: '', body: '', type: type.value })
                      setShowEditor(true)
                    }}
                    className="w-full px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
                  >
                    Create Template
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {editingTemplate ? 'Edit Email Template' : 'Create Email Template'}
                </h2>
                <button
                  onClick={() => {
                    setShowEditor(false)
                    setEditingTemplate(null)
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSave} className="p-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Template Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {TEMPLATE_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Subject</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Welcome to {company_name}!"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Body</label>
                    <textarea
                      name="body"
                      value={formData.body}
                      onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                      rows={15}
                      placeholder="Enter email content here..."
                      required
                    />
                  </div>
                </div>

                {/* Variables Panel */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span>🏷️</span> Available Variables
                  </h3>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {VARIABLES.map((variable) => (
                      <button
                        key={variable.name}
                        type="button"
                        onClick={() => insertVariable(variable.name)}
                        className="w-full text-left p-2 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition group"
                      >
                        <p className="text-xs font-mono font-bold text-blue-600 group-hover:text-blue-700">
                          {variable.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{variable.desc}</p>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-800">
                      <strong>💡 Tip:</strong> Click any variable to insert it at cursor position
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditor(false)
                    setEditingTemplate(null)
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition"
                >
                  {editingTemplate ? 'Save Changes' : 'Create Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

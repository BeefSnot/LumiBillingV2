'use client'

import { useState, useEffect } from 'react'

interface DomainCheck {
  domain: string
  available: boolean | null
  loading: boolean
  price?: number
}

export default function ClientDomainsPage() {
  const [searchDomain, setSearchDomain] = useState('')
  const [domainChecks, setDomainChecks] = useState<DomainCheck[]>([])
  const [myDomains, setMyDomains] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'register' | 'transfer' | 'my-domains'>('register')

  useEffect(() => {
    fetchMyDomains()
  }, [])

  const fetchMyDomains = async () => {
    try {
      const response = await fetch('/api/client/domains')
      const data = await response.json()
      setMyDomains(data.domains || [])
    } catch (error) {
      console.error('Failed to fetch domains:', error)
    }
  }

  const handleDomainSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const domain = searchDomain.toLowerCase().trim()
    if (!domain) return

    const extensions = ['.com', '.net', '.org', '.io', '.co']
    const baseDomain = domain.replace(/\.(com|net|org|io|co)$/i, '')
    
    const checks: DomainCheck[] = extensions.map(ext => ({
      domain: baseDomain + ext,
      available: null,
      loading: true,
    }))

    setDomainChecks(checks)

    // Simulate domain availability check
    checks.forEach(async (check, index) => {
      setTimeout(() => {
        const available = Math.random() > 0.5
        const price = available ? Math.floor(Math.random() * 20) + 9.99 : undefined
        
        setDomainChecks(prev => prev.map((c, i) => 
          i === index ? { ...c, available, loading: false, price } : c
        ))
      }, 500 + index * 200)
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Domain Management</h1>
        <p className="mt-2 text-gray-600">Register, transfer, and manage your domains</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('register')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'register'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Register Domain
          </button>
          <button
            onClick={() => setActiveTab('transfer')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'transfer'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Transfer Domain
          </button>
          <button
            onClick={() => setActiveTab('my-domains')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'my-domains'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Domains ({myDomains.length})
          </button>
        </nav>
      </div>

      {/* Register Tab */}
      {activeTab === 'register' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Find Your Perfect Domain</h3>
            <form onSubmit={handleDomainSearch} className="flex gap-4">
              <input
                type="text"
                value={searchDomain}
                onChange={(e) => setSearchDomain(e.target.value)}
                placeholder="Search for a domain..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-lg"
              >
                Search
              </button>
            </form>
          </div>

          {domainChecks.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Search Results</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {domainChecks.map((check) => (
                  <div key={check.domain} className="p-6 flex items-center justify-between hover:bg-gray-50 transition">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        check.loading ? 'bg-gray-100' :
                        check.available ? 'bg-emerald-100' : 'bg-red-100'
                      }`}>
                        {check.loading ? (
                          <svg className="animate-spin h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : check.available ? (
                          <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{check.domain}</p>
                        <p className="text-sm text-gray-500">
                          {check.loading ? 'Checking...' :
                           check.available ? 'Available' : 'Already registered'}
                        </p>
                      </div>
                    </div>
                    {check.available && check.price && (
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-gray-900">${check.price}/yr</span>
                        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                          Add to Cart
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transfer Tab */}
      {activeTab === 'transfer' && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transfer Your Domain</h3>
          <p className="text-gray-600 mb-6">Move your existing domain to us for better management and pricing</p>
          <form className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Domain Name</label>
              <input
                type="text"
                placeholder="example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Authorization Code (EPP Code)</label>
              <input
                type="text"
                placeholder="Enter your EPP code"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <p className="text-xs text-gray-500">Get this from your current registrar</p>
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-lg"
            >
              Start Transfer
            </button>
          </form>
        </div>
      )}

      {/* My Domains Tab */}
      {activeTab === 'my-domains' && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          {myDomains.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No domains yet</h3>
              <p className="mt-2 text-sm text-gray-500">Register your first domain to get started</p>
              <button
                onClick={() => setActiveTab('register')}
                className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
              >
                Register Domain
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {myDomains.map((domain) => (
                <div key={domain.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{domain.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Expires: {new Date(domain.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition">
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

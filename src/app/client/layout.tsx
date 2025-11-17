'use client'

import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const navigationGroups = [
  { 
    name: 'Dashboard', 
    href: '/client',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
  {
    name: 'Services',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
      </svg>
    ),
    items: [
      { name: 'My Services', href: '/client/services' },
      { name: 'Order New Service', href: '/client/products' },
      { name: 'Domains', href: '/client/domains' },
    ]
  },
  {
    name: 'Billing',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    items: [
      { name: 'Invoices', href: '/client/invoices' },
    ]
  },
  {
    name: 'Support',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    items: [
      { name: 'Support Tickets', href: '/client/tickets' },
      { name: 'Knowledge Base', href: '/client/knowledge-base' },
      { name: 'Announcements', href: '/client/announcements' },
    ]
  },
  {
    name: 'Account',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    items: [
      { name: 'Notifications', href: '/client/notifications' },
      { name: 'Settings', href: '/client/settings' },
    ]
  },
]

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSubMenuOpen, setMobileSubMenuOpen] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut({ callbackUrl: '/login' })
  }

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl font-bold text-white">L</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col">
      {/* Modern Navbar */}
      <nav className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/client" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md flex items-center justify-center group-hover:shadow-lg transition-all group-hover:scale-105">
                  <span className="text-xl font-bold text-white">L</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent hidden sm:block">
                  Lumi Billing
                </span>
              </Link>
            </div>
              
            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:space-x-1">
                {navigationGroups.map((group) => {
                  if (group.href) {
                    const isActive = pathname === group.href
                    return (
                      <Link
                        key={group.name}
                        href={group.href}
                        className={`
                          relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
                          ${isActive 
                            ? 'text-blue-600 bg-blue-50/80' 
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                          }
                        `}
                      >
                        {group.icon}
                        <span>{group.name}</span>
                      </Link>
                    )
                  }

                  const hasActiveChild = group.items?.some(item => pathname === item.href)
                  return (
                    <div key={group.name} className="relative group/nav">
                      <button
                        className={`
                          relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
                          ${hasActiveChild 
                            ? 'text-blue-600 bg-blue-50/80' 
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                          }
                        `}
                      >
                        {group.icon}
                        <span>{group.name}</span>
                        <svg className="w-4 h-4 transition-transform group-hover/nav:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-xl ring-1 ring-black/5 overflow-hidden opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-200 transform group-hover/nav:translate-y-0 -translate-y-2">
                        {group.items?.map((item) => {
                          const isActive = pathname === item.href
                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              className={`
                                block px-4 py-3 text-sm transition-colors border-l-4
                                ${isActive
                                  ? 'bg-blue-50 text-blue-600 font-semibold border-blue-500'
                                  : 'text-gray-700 hover:bg-gray-50 border-transparent hover:border-gray-300'
                                }
                              `}
                            >
                              {item.name}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

            {/* Right Side: User Menu & Mobile Toggle */}
            <div className="flex items-center space-x-2">
              {/* User Menu - Desktop */}
              <div className="hidden lg:block relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                    <span className="text-sm font-semibold text-white">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left hidden xl:block">
                    <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[120px]">{session.user.email}</p>
                  </div>
                  <svg className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl ring-1 ring-black/10 overflow-hidden z-20">
                      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-br from-blue-50 to-white">
                        <p className="text-sm font-semibold text-gray-900">{session.user.name}</p>
                        <p className="text-xs text-gray-600 truncate">{session.user.email}</p>
                      </div>
                      <button
                        onClick={handleSignOut}
                        disabled={signingOut}
                        className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2 disabled:opacity-50"
                      >
                        {signingOut ? (
                          <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Signing out...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Sign out</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-1">
              {/* User Info - Mobile */}
              <div className="pb-3 mb-3 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{session.user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                  </div>
                </div>
              </div>

              {/* Navigation Items - Mobile */}
              {navigationGroups.map((group) => {
                if (group.href) {
                  const isActive = pathname === group.href
                  return (
                    <Link
                      key={group.name}
                      href={group.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                        ${isActive 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      {group.icon}
                      <span>{group.name}</span>
                    </Link>
                  )
                }

                const hasActiveChild = group.items?.some(item => pathname === item.href)
                const isOpen = mobileSubMenuOpen === group.name
                
                return (
                  <div key={group.name}>
                    <button
                      onClick={() => setMobileSubMenuOpen(isOpen ? null : group.name)}
                      className={`
                        w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                        ${hasActiveChild 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        {group.icon}
                        <span>{group.name}</span>
                      </div>
                      <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {isOpen && (
                      <div className="mt-1 ml-4 space-y-1">
                        {group.items?.map((item) => {
                          const isActive = pathname === item.href
                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`
                                block px-4 py-2 rounded-lg text-sm transition-colors border-l-2
                                ${isActive
                                  ? 'bg-blue-50 text-blue-600 font-semibold border-blue-500'
                                  : 'text-gray-600 hover:bg-gray-50 border-gray-200'
                                }
                              `}
                            >
                              {item.name}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Sign Out - Mobile */}
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 mt-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>{signingOut ? 'Signing out...' : 'Sign out'}</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="py-8 flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 px-4 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-600">
          <p>
            Lumi Billing Panel |{' '}
            <a
              href="https://lumisolutions.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium transition"
            >
              Lumi Solutions
            </a>
            {' '}| 2025
          </p>
        </div>
      </footer>
    </div>
  )
}

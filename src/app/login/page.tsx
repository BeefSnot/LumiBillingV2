'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface SavedAccount {
  email: string
  password: string
  label: string
  color: string
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([])
  const [dontAskAgain, setDontAskAgain] = useState(false)

  // Load saved accounts and preferences on mount
  useEffect(() => {
    const saved = localStorage.getItem('savedAccounts')
    if (saved) {
      try {
        setSavedAccounts(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse saved accounts:', e)
      }
    }
  }, [])

  const saveAccount = (save: boolean) => {
    if (save) {
      const newAccount: SavedAccount = {
        email,
        password,
        label: email.split('@')[0],
        color: getRandomColor()
      }

      // Check if account already exists
      const existing = savedAccounts.find(acc => acc.email === email)
      if (!existing) {
        const updated = [...savedAccounts, newAccount].slice(-5) // Keep max 5
        setSavedAccounts(updated)
        localStorage.setItem('savedAccounts', JSON.stringify(updated))
      }
    }

    if (dontAskAgain) {
      localStorage.setItem('dontAskToSave', 'true')
    }

    setShowSaveModal(false)
    // Redirect after saving/declining
    window.location.href = '/'
  }

  const getRandomColor = () => {
    const colors = ['blue', 'purple', 'pink', 'indigo', 'cyan', 'teal', 'emerald', 'green']
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const removeSavedAccount = (emailToRemove: string) => {
    const updated = savedAccounts.filter(acc => acc.email !== emailToRemove)
    setSavedAccounts(updated)
    localStorage.setItem('savedAccounts', JSON.stringify(updated))
  }

  const loadSavedAccount = (account: SavedAccount) => {
    setEmail(account.email)
    setPassword(account.password)
  }

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string, border: string, hoverBorder: string, text: string, textMuted: string }> = {
      blue: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-400/30',
        hoverBorder: 'hover:border-blue-400/50',
        text: 'text-blue-300',
        textMuted: 'text-blue-200/70'
      },
      purple: {
        bg: 'bg-purple-500/10',
        border: 'border-purple-400/30',
        hoverBorder: 'hover:border-purple-400/50',
        text: 'text-purple-300',
        textMuted: 'text-purple-200/70'
      },
      pink: {
        bg: 'bg-pink-500/10',
        border: 'border-pink-400/30',
        hoverBorder: 'hover:border-pink-400/50',
        text: 'text-pink-300',
        textMuted: 'text-pink-200/70'
      },
      indigo: {
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-400/30',
        hoverBorder: 'hover:border-indigo-400/50',
        text: 'text-indigo-300',
        textMuted: 'text-indigo-200/70'
      },
      cyan: {
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-400/30',
        hoverBorder: 'hover:border-cyan-400/50',
        text: 'text-cyan-300',
        textMuted: 'text-cyan-200/70'
      },
      teal: {
        bg: 'bg-teal-500/10',
        border: 'border-teal-400/30',
        hoverBorder: 'hover:border-teal-400/50',
        text: 'text-teal-300',
        textMuted: 'text-teal-200/70'
      },
      emerald: {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-400/30',
        hoverBorder: 'hover:border-emerald-400/50',
        text: 'text-emerald-300',
        textMuted: 'text-emerald-200/70'
      },
      green: {
        bg: 'bg-green-500/10',
        border: 'border-green-400/30',
        hoverBorder: 'hover:border-green-400/50',
        text: 'text-green-300',
        textMuted: 'text-green-200/70'
      }
    }
    return colorMap[color] || colorMap.blue
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
        setLoading(false)
      } else {
        // Check if we should ask to save
        const dontAsk = localStorage.getItem('dontAskToSave')
        const alreadySaved = savedAccounts.some(acc => acc.email === email)
        
        if (!dontAsk && !alreadySaved) {
          setShowSaveModal(true)
          // Don't redirect yet - let user interact with modal
        } else {
          window.location.href = '/'
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Content */}
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-block relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 blur-2xl opacity-50 animate-pulse" />
              <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 rounded-2xl shadow-2xl shadow-blue-500/50 mx-auto mb-6">
                <span className="text-4xl font-bold text-white">L</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
              Lumi<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Billing</span>
            </h1>
            <p className="text-blue-200/80 text-sm">Professional Billing Management System</p>
          </div>

          {/* Login Form */}
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-8 animate-slide-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-100">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-200" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="relative w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition backdrop-blur-sm"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-100">Password</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-200" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="relative w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition backdrop-blur-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm backdrop-blur-sm animate-shake">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-200" />
                <div className="relative px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-semibold text-white shadow-lg transform group-hover:scale-[1.02] transition duration-200 flex items-center justify-center space-x-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <span>Sign In</span>
                  )}
                </div>
              </button>
            </form>

            {/* Saved Accounts */}
            {savedAccounts.length > 0 && (
              <div className="mt-8 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-blue-200/60 font-medium">SAVED ACCOUNTS</p>
                  <button
                    onClick={() => {
                      if (confirm('Clear all saved accounts?')) {
                        setSavedAccounts([])
                        localStorage.removeItem('savedAccounts')
                      }
                    }}
                    className="text-xs text-red-400/60 hover:text-red-400 transition"
                  >
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {savedAccounts.map((account, index) => {
                    const colors = getColorClasses(account.color)
                    return (
                      <div
                        key={index}
                        className={`${colors.bg} backdrop-blur-sm border ${colors.border} rounded-xl p-3 ${colors.hoverBorder} transition cursor-pointer relative group`}
                        onClick={() => loadSavedAccount(account)}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeSavedAccount(account.email)
                          }}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition text-red-400 hover:text-red-300"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <p className={`text-xs font-semibold ${colors.text}`}>👤 {account.label}</p>
                        <p className={`text-xs ${colors.textMuted} truncate`}>{account.email}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-blue-200/60 mt-6">
            Don't have an account?{' '}
            <a href="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition">
              Sign up
            </a>
          </p>
        </div>
      </div>

      {/* Save Account Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/20 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Save Account?</h3>
              <p className="text-blue-200/70 text-sm">
                Would you like to save your login credentials for quick access next time?
              </p>
              {savedAccounts.length > 0 && (
                <p className="text-blue-300/60 text-xs mt-2">
                  Currently saved: {savedAccounts.length}/5 accounts
                </p>
              )}
              {savedAccounts.length === 0 && (
                <p className="text-cyan-400/60 text-xs mt-2">
                  You can save up to 5 accounts on this device
                </p>
              )}
            </div>

            <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-3 mb-4">
              <p className="text-xs text-blue-300 font-medium mb-1">Account to save:</p>
              <p className="text-sm text-white truncate">{email}</p>
            </div>

            <div className="flex items-center space-x-2 mb-6 bg-white/5 rounded-lg p-3">
              <input
                type="checkbox"
                id="dontAsk"
                checked={dontAskAgain}
                onChange={(e) => setDontAskAgain(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
              />
              <label htmlFor="dontAsk" className="text-sm text-blue-200/80 cursor-pointer">
                Don't ask me again
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => saveAccount(false)}
                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/20 text-white rounded-xl font-medium transition"
              >
                No Thanks
              </button>
              <button
                onClick={() => saveAccount(true)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-medium shadow-lg transition"
              >
                Save Account
              </button>
            </div>

            <p className="text-xs text-blue-200/50 text-center mt-4">
              Credentials are stored locally on this device only
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-slide-up { animation: slide-up 0.6s ease-out 0.2s both; }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </div>
  )
}

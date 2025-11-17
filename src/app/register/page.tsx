'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    company: '',
    phone: '',
    address: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  })
  const [step, setStep] = useState(1) // Multi-step form
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      setSuccess(true)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        </div>

        <div className="relative flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-8 text-center animate-slide-up">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-2xl shadow-green-500/50 mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Check Your Email!</h2>
            <p className="text-blue-200/80 mb-6">
              We've sent a verification link to<br />
              <strong className="text-white">{formData.email}</strong>
            </p>
            <div className="bg-green-500/10 backdrop-blur-sm border border-green-400/30 rounded-xl p-4 mb-6">
              <p className="text-sm text-green-200">
                📧 Click the link in your email to verify your account
              </p>
            </div>
            <button 
              onClick={() => router.push('/login')}
              className="w-full relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition" />
              <div className="relative px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-semibold text-white shadow-lg transform group-hover:scale-[1.02] transition">
                Back to Login
              </div>
            </button>
          </div>
        </div>

        <style jsx>{`
          @keyframes blob { 0%, 100% { transform: translate(0, 0) scale(1); } 25% { transform: translate(20px, -50px) scale(1.1); } 50% { transform: translate(-20px, 20px) scale(0.9); } 75% { transform: translate(50px, 50px) scale(1.05); } }
          @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .animate-blob { animation: blob 7s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
          .animate-slide-up { animation: slide-up 0.6s ease-out; }
        `}</style>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl animate-fade-in">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-block relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 blur-2xl opacity-50 animate-pulse" />
              <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 rounded-2xl shadow-2xl shadow-blue-500/50 mx-auto mb-6">
                <span className="text-4xl font-bold text-white">L</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
              Lumi<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Billing</span>
            </h1>
            <p className="text-blue-200/80 text-sm">Create your account in just a few steps</p>
          </div>

          {/* Register Form Card */}
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-8 animate-slide-up">
            {/* Progress Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${step >= 1 ? 'text-blue-300' : 'text-blue-400/50'}`}>Account</span>
                <span className={`text-sm font-medium ${step >= 2 ? 'text-blue-300' : 'text-blue-400/50'}`}>Contact</span>
                <span className={`text-sm font-medium ${step >= 3 ? 'text-blue-300' : 'text-blue-400/50'}`}>Address</span>
              </div>
              <div className="relative">
                <div className="overflow-hidden h-2 flex rounded-full bg-white/10">
                  <div className="transition-all duration-500 ease-out bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full" style={{width: `${(step / 3) * 100}%`}}></div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 backdrop-blur-sm border border-red-400/30 rounded-xl p-4 animate-shake">
                  <p className="text-sm text-red-200 text-center">{error}</p>
                </div>
              )}

              {/* Step 1: Account Information */}
              {step === 1 && (
                <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium text-blue-200">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium text-blue-200">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-blue-200">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="company" className="text-sm font-medium text-blue-200">
                  Company Name (Optional)
                </label>
                <input
                  id="company"
                  type="text"
                  placeholder="Acme Inc."
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-blue-200">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-blue-200">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-blue-200">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition"
                  required
                />
              </div>
                </div>
              )}

              {/* Step 2: Address Information */}
              {step === 2 && (
                <div className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="address" className="text-sm font-medium text-blue-200">
                  Street Address
                </label>
                <input
                  id="address"
                  type="text"
                  placeholder="123 Main St"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="address2" className="text-sm font-medium text-blue-200">
                  Apartment, Suite, etc. (Optional)
                </label>
                <input
                  id="address2"
                  type="text"
                  placeholder="Apt 4B"
                  value={formData.address2}
                  onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm font-medium text-blue-200">
                    City
                  </label>
                  <input
                    id="city"
                    type="text"
                    placeholder="New York"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="state" className="text-sm font-medium text-blue-200">
                    State/Province
                  </label>
                  <input
                    id="state"
                    type="text"
                    placeholder="NY"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition"
                    required
                  />
                </div>
              </div>
                </div>
              )}

              {/* Step 3: Location Details */}
              {step === 3 && (
                <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="postalCode" className="text-sm font-medium text-blue-200">
                    Postal Code
                  </label>
                  <input
                    id="postalCode"
                    type="text"
                    placeholder="10001"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="country" className="text-sm font-medium text-blue-200">
                    Country
                  </label>
                  <select
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition"
                    required
                  >
                    <option value="" className="bg-gray-900">Select Country</option>
                    <option value="US" className="bg-gray-900">🇺🇸 United States</option>
                    <option value="CA" className="bg-gray-900">🇨🇦 Canada</option>
                    <option value="GB" className="bg-gray-900">🇬🇧 United Kingdom</option>
                    <option value="AU" className="bg-gray-900">🇦🇺 Australia</option>
                    <option value="DE" className="bg-gray-900">🇩🇪 Germany</option>
                    <option value="FR" className="bg-gray-900">🇫🇷 France</option>
                    <option value="ES" className="bg-gray-900">🇪🇸 Spain</option>
                    <option value="IT" className="bg-gray-900">🇮🇹 Italy</option>
                    <option value="NL" className="bg-gray-900">🇳🇱 Netherlands</option>
                    <option value="SE" className="bg-gray-900">🇸🇪 Sweden</option>
                    <option value="NO" className="bg-gray-900">🇳🇴 Norway</option>
                    <option value="DK" className="bg-gray-900">🇩🇰 Denmark</option>
                    <option value="FI" className="bg-gray-900">🇫🇮 Finland</option>
                    <option value="PL" className="bg-gray-900">🇵🇱 Poland</option>
                    <option value="BR" className="bg-gray-900">🇧🇷 Brazil</option>
                    <option value="MX" className="bg-gray-900">🇲🇽 Mexico</option>
                    <option value="AR" className="bg-gray-900">🇦🇷 Argentina</option>
                    <option value="IN" className="bg-gray-900">🇮🇳 India</option>
                    <option value="CN" className="bg-gray-900">🇨🇳 China</option>
                    <option value="JP" className="bg-gray-900">🇯🇵 Japan</option>
                    <option value="KR" className="bg-gray-900">🇰🇷 South Korea</option>
                    <option value="SG" className="bg-gray-900">🇸🇬 Singapore</option>
                    <option value="ZA" className="bg-gray-900">🇿🇦 South Africa</option>
                    <option value="NZ" className="bg-gray-900">🇳🇿 New Zealand</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-400/30 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-blue-300 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-blue-200">
                    Your address information is used for billing purposes and to comply with tax regulations. We never share your personal information with third parties.
                  </p>
                </div>
              </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="flex-1 relative group"
                  >
                    <div className="relative px-6 py-3 bg-white/10 border border-white/20 rounded-xl font-semibold text-white hover:bg-white/20 transition">
                      Back
                    </div>
                  </button>
                )}
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="flex-1 relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition" />
                    <div className="relative px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-semibold text-white shadow-lg transform group-hover:scale-[1.02] transition">
                      Continue
                    </div>
                  </button>
                ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition" />
                <div className="relative px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-semibold text-white shadow-lg transform group-hover:scale-[1.02] transition">
                  {loading ? 'Creating Account...' : 'Create Account'}
                </div>
              </button>
                )}
              </div>

              <div className="text-center">
                <p className="text-blue-200/80 text-sm">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => router.push('/login')}
                    className="text-blue-300 hover:text-white font-semibold transition"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

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
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); }
          50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.8); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out 0.2s both;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

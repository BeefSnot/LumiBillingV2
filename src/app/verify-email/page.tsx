'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams?.get('token')
    
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link')
      return
    }

    fetch(`/api/auth/verify-email?token=${token}`)
      .then(async (res) => {
        const data = await res.json()
        if (res.ok) {
          setStatus('success')
          setMessage(data.message)
        } else {
          setStatus('error')
          setMessage(data.error || 'Verification failed')
        }
      })
      .catch(() => {
        setStatus('error')
        setMessage('An error occurred during verification')
      })
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lumi-blue-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === 'loading' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 border-4 border-lumi-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <CardTitle className="text-2xl font-bold">Verifying Email...</CardTitle>
            </>
          )}
          {status === 'success' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-green-600">Email Verified!</CardTitle>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-red-600">Verification Failed</CardTitle>
            </>
          )}
          <CardDescription className="mt-4">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'success' && (
            <Button onClick={() => router.push('/login')} className="w-full">
              Go to Login
            </Button>
          )}
          {status === 'error' && (
            <Button onClick={() => router.push('/register')} variant="outline" className="w-full">
              Back to Register
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

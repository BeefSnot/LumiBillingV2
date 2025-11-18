export const dynamic = 'force-dynamic'

import Link from 'next/link'
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function VerifyEmailPage({ searchParams }: { searchParams: any }) {
  // Read token from search params in server component
  const token = (searchParams && (searchParams.get ? searchParams.get('token') : searchParams.token)) || ''
  let status: 'success' | 'error'
  let message = ''

  if (!token) {
    status = 'error'
    message = 'Invalid verification link'
  } else {
    try {
      const base = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const res = await fetch(`${base}/api/auth/verify-email?token=${encodeURIComponent(token)}`, { cache: 'no-store' })
      const data = await res.json()
      if (res.ok) {
        status = 'success'
        message = data.message
      } else {
        status = 'error'
        message = data.error || 'Verification failed'
      }
    } catch (err) {
      status = 'error'
      message = 'An error occurred during verification'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lumi-blue-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {/* Server components render final result; no loading on server side */}
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
            <Link href="/login" className="w-full">
              <Button className="w-full">Go to Login</Button>
            </Link>
          )}
          {status === 'error' && (
            <Link href="/register" className="w-full">
              <Button variant="outline" className="w-full">Back to Register</Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'

// PayPal API Base URLs
const PAYPAL_API_BASE = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

// Get PayPal Access Token
async function getPayPalAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64')

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const data = await response.json()
  return data.access_token
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/login?error=Unauthorized`
      )
    }

    const searchParams = req.nextUrl.searchParams
    const token = searchParams.get('token')
    const invoiceId = searchParams.get('invoiceId')

    if (!token || !invoiceId) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/client/invoices?error=Missing payment details`
      )
    }

    // Get invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { user: true },
    })

    if (!invoice) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/client/invoices?error=Invoice not found`
      )
    }

    if (invoice.userId !== session.user.id) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/client/invoices?error=Unauthorized`
      )
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken()

    // Capture the payment
    const captureResponse = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${token}/capture`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )

    const captureData = await captureResponse.json()

    if (!captureResponse.ok || captureData.status !== 'COMPLETED') {
      console.error('PayPal capture error:', captureData)
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/client/invoices?error=Payment capture failed`
      )
    }

    // Get capture details
    const capture = captureData.purchase_units[0].payments.captures[0]

    // Update invoice status and create a transaction record
    await prisma.$transaction([
      prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: 'PAID',
          paidDate: new Date(),
        },
      }),
      prisma.transaction.create({
        data: {
          userId: invoice.userId,
          invoiceId: invoice.id,
          amount: invoice.total,
          gateway: 'PAYPAL',
          transactionId: capture.id,
          description: `PayPal capture for invoice ${invoice.invoiceNumber}`,
        },
      }),
    ])

    // Log audit event
    await createAuditLog({
      userId: session.user.id,
      userEmail: invoice.user.email,
      action: 'PAYMENT_RECEIVED',
      entity: 'Invoice',
      entityId: invoice.id,
      details: JSON.stringify({
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.total,
        paymentMethod: 'PAYPAL',
        transactionId: capture.id,
        orderId: token,
      }),
    })

    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/client/invoices?success=Payment successful`
    )
  } catch (error) {
    console.error('PayPal capture error:', error)
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/client/invoices?error=Payment processing failed`
    )
  }
}

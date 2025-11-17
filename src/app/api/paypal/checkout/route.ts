import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { invoiceId } = await req.json()

    // Get invoice details
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        user: true,
        items: true,
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (invoice.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (invoice.status === 'PAID') {
      return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 })
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken()

    // Create PayPal order
    const createOrderResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: invoice.invoiceNumber,
            description: `Invoice #${invoice.invoiceNumber}`,
            custom_id: invoice.id,
            amount: {
              currency_code: 'USD',
              value: invoice.total.toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: 'USD',
                  value: invoice.subtotal.toFixed(2),
                },
                tax_total: {
                  currency_code: 'USD',
                  value: invoice.tax.toFixed(2),
                },
              },
            },
            items: invoice.items.map(item => ({
              name: item.description.slice(0, 127), // PayPal limit
              description: item.description.slice(0, 127),
              unit_amount: {
                currency_code: 'USD',
                value: item.amount.toFixed(2),
              },
              quantity: '1',
              category: 'DIGITAL_GOODS',
            })),
          },
        ],
        application_context: {
          brand_name: 'Lumi Billing',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXTAUTH_URL}/api/paypal/capture?invoiceId=${invoice.id}`,
          cancel_url: `${process.env.NEXTAUTH_URL}/client/invoices?canceled=true`,
        },
      }),
    })

    const orderData = await createOrderResponse.json()

    if (!createOrderResponse.ok) {
      console.error('PayPal order creation error:', orderData)
      return NextResponse.json(
        { error: 'Failed to create PayPal order', details: orderData },
        { status: 500 }
      )
    }

    // Get approval URL
    const approvalUrl = orderData.links.find((link: any) => link.rel === 'approve')?.href

    if (!approvalUrl) {
      return NextResponse.json(
        { error: 'No approval URL returned from PayPal' },
        { status: 500 }
      )
    }

    // Store PayPal order ID in invoice
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        paymentMethod: 'PAYPAL',
        paymentGatewayOrderId: orderData.id,
      },
    })

    return NextResponse.json({
      orderId: orderData.id,
      approvalUrl,
    })
  } catch (error) {
    console.error('PayPal checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create PayPal checkout' },
      { status: 500 }
    )
  }
}

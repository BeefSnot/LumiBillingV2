import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'
import crypto from 'crypto'

// Verify PayPal webhook signature
function verifyWebhookSignature(
  webhookId: string,
  transmissionId: string,
  transmissionTime: string,
  certUrl: string,
  authAlgo: string,
  transmissionSig: string,
  webhookEvent: any
): boolean {
  try {
    // Create the expected signature string
    const expectedSig = `${transmissionId}|${transmissionTime}|${webhookId}|${crypto
      .createHash('sha256')
      .update(JSON.stringify(webhookEvent))
      .digest('hex')}`

    // In production, you should:
    // 1. Download the cert from certUrl
    // 2. Verify the cert is valid and from PayPal
    // 3. Use the cert to verify the signature
    // For now, we'll do basic validation
    
    return transmissionSig && transmissionSig.length > 0
  } catch (error) {
    console.error('Webhook signature verification error:', error)
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Get webhook headers
    const transmissionId = req.headers.get('paypal-transmission-id') || ''
    const transmissionTime = req.headers.get('paypal-transmission-time') || ''
    const certUrl = req.headers.get('paypal-cert-url') || ''
    const authAlgo = req.headers.get('paypal-auth-algo') || ''
    const transmissionSig = req.headers.get('paypal-transmission-sig') || ''
    
    const webhookId = process.env.PAYPAL_WEBHOOK_ID || ''

    // Verify webhook signature
    const isValid = verifyWebhookSignature(
      webhookId,
      transmissionId,
      transmissionTime,
      certUrl,
      authAlgo,
      transmissionSig,
      body
    )

    if (!isValid && process.env.NODE_ENV === 'production') {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const eventType = body.event_type

    // Handle different event types
    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED': {
        const resource = body.resource
        const customId = resource.custom_id // This is our invoice ID

        if (!customId) {
          console.error('No custom_id in webhook payload')
          return NextResponse.json({ received: true })
        }

        // Get invoice
        const invoice = await prisma.invoice.findUnique({
          where: { id: customId },
          include: { user: true },
        })

        if (!invoice) {
          console.error('Invoice not found:', customId)
          return NextResponse.json({ received: true })
        }

        // Skip if already paid
        if (invoice.status === 'PAID') {
          return NextResponse.json({ received: true })
        }

        // Update invoice
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            status: 'PAID',
            paidAt: new Date(resource.create_time),
            paymentMethod: 'PAYPAL',
            paymentGatewayTransactionId: resource.id,
          },
        })

        // Log audit event
        await createAuditLog({
          userId: invoice.userId,
          userEmail: invoice.user.email,
          action: 'PAYMENT_RECEIVED',
          entity: 'Invoice',
          entityId: invoice.id,
          details: JSON.stringify({
            invoiceNumber: invoice.invoiceNumber,
            amount: invoice.total,
            paymentMethod: 'PAYPAL',
            transactionId: resource.id,
            captureId: resource.id,
            status: resource.status,
          }),
        })

        break
      }

      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.REFUNDED': {
        const resource = body.resource
        const customId = resource.custom_id

        if (!customId) {
          return NextResponse.json({ received: true })
        }

        const invoice = await prisma.invoice.findUnique({
          where: { id: customId },
          include: { user: true },
        })

        if (!invoice) {
          return NextResponse.json({ received: true })
        }

        // Log the event
        await createAuditLog({
          userId: invoice.userId,
          userEmail: invoice.user.email,
          action: eventType === 'PAYMENT.CAPTURE.REFUNDED' ? 'PAYMENT_REFUNDED' : 'PAYMENT_DENIED',
          entity: 'Invoice',
          entityId: invoice.id,
          details: JSON.stringify({
            invoiceNumber: invoice.invoiceNumber,
            amount: invoice.total,
            paymentMethod: 'PAYPAL',
            transactionId: resource.id,
            status: resource.status,
            eventType,
          }),
        })

        // If refunded, update invoice status
        if (eventType === 'PAYMENT.CAPTURE.REFUNDED') {
          await prisma.invoice.update({
            where: { id: invoice.id },
            data: {
              status: 'REFUNDED',
            },
          })
        }

        break
      }

      default:
        console.log('Unhandled webhook event type:', eventType)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('PayPal webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

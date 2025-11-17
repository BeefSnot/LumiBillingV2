import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { sendInvoiceEmail } from '@/lib/email'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const { invoiceId, userId } = session.metadata as { invoiceId: string; userId: string }

        // Update invoice status
        const invoice = await prisma.invoice.update({
          where: { id: invoiceId },
          data: {
            status: 'PAID',
            paidDate: new Date(),
          },
          include: {
            user: true,
          }
        })

        // Create transaction record
        await prisma.transaction.create({
          data: {
            userId,
            invoiceId,
            amount: invoice.total,
            gateway: 'STRIPE',
            transactionId: session.payment_intent as string,
            description: `Stripe payment for invoice ${invoice.invoiceNumber}`,
          }
        })

        // Send payment confirmation email
        await sendInvoiceEmail(
          invoice.user.email,
          invoice.invoiceNumber,
          invoice.total,
          invoice.dueDate
        )

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.error('Payment failed:', paymentIntent.id)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

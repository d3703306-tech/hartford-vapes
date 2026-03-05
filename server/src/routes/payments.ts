import { Router, Response } from 'express'
import Stripe from 'stripe'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// Initialize Stripe (use test key if not in production)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-12-18.acacia',
})

// Create payment intent
router.post('/create-payment-intent', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.body

    // Get order
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: req.user!.id,
      },
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    if (order.paymentStatus === 'PAID') {
      return res.status(400).json({ error: 'Order already paid' })
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100), // Stripe uses cents
      currency: 'usd',
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId: req.user!.id,
      },
    })

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error('Create payment intent error:', error)
    res.status(500).json({ error: 'Failed to create payment' })
  }
})

// Confirm payment (webhook handler would call this)
router.post('/confirm', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, paymentIntentId } = req.body

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: req.user!.id,
      },
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status === 'succeeded') {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          paymentId: paymentIntentId,
          status: 'CONFIRMED',
          paidAt: new Date(),
        },
      })

      res.json({ message: 'Payment successful', status: 'PAID' })
    } else {
      res.status(400).json({ error: 'Payment not completed' })
    }
  } catch (error) {
    console.error('Confirm payment error:', error)
    res.status(500).json({ error: 'Failed to confirm payment' })
  }
})

// Stripe webhook
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event: Stripe.Event

  try {
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
    } else {
      event = req.body as Stripe.Event
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log('Payment succeeded:', paymentIntent.id)
      
      // Update order status
      if (paymentIntent.metadata.orderId) {
        await prisma.order.update({
          where: { id: paymentIntent.metadata.orderId },
          data: {
            paymentStatus: 'PAID',
            status: 'CONFIRMED',
            paidAt: new Date(),
          },
        })
      }
      break

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent
      console.log('Payment failed:', failedPayment.id)
      break

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  res.json({ received: true })
})

export default router

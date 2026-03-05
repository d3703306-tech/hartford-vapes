import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// Generate order number
const generateOrderNumber = () => {
  const date = new Date()
  const year = date.getFullYear()
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
  return `HV-${year}-${random}`
}

// Get orders
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
              },
            },
          },
        },
        shippingAddress: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(orders)
  } catch (error) {
    console.error('Get orders error:', error)
    res.status(500).json({ error: 'Failed to get orders' })
  }
})

// Get single order
router.get('/:orderNumber', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { orderNumber } = req.params

    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        userId: req.user!.id,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
              },
            },
          },
        },
        shippingAddress: true,
        billingAddress: true,
      },
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    res.json(order)
  } catch (error) {
    console.error('Get order error:', error)
    res.status(500).json({ error: 'Failed to get order' })
  }
})

// Create order
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { shippingAddressId, billingAddressId, paymentMethod, notes } = req.body

    // Get cart
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' })
    }

    // Calculate totals
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )
    const tax = subtotal * 0.0825 // 8.25% tax
    const shipping = subtotal >= 50 ? 0 : 5.99 // Free shipping over $50
    const total = subtotal + tax + shipping

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: req.user!.id,
        subtotal,
        tax,
        shipping,
        total,
        shippingAddressId,
        billingAddressId,
        paymentMethod,
        notes,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            productName: item.product.name,
            productImage: item.product.images[0] || null,
            quantity: item.quantity,
            price: item.product.price,
            variant: item.variant,
          })),
        },
      },
      include: {
        items: true,
        shippingAddress: true,
      },
    })

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    })

    res.status(201).json(order)
  } catch (error) {
    console.error('Create order error:', error)
    res.status(500).json({ error: 'Failed to create order' })
  }
})

// Cancel order
router.post('/:orderNumber/cancel', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { orderNumber } = req.params

    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        userId: req.user!.id,
      },
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
      return res.status(400).json({ error: 'Order cannot be cancelled' })
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'CANCELLED',
        paymentStatus: 'REFUNDED',
      },
    })

    res.json({ message: 'Order cancelled' })
  } catch (error) {
    console.error('Cancel order error:', error)
    res.status(500).json({ error: 'Failed to cancel order' })
  }
})

export default router

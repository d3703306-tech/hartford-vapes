import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// Get cart
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const cart = await prisma.cart.findUnique({
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
                price: true,
                inStock: true,
                stock: true,
              },
            },
          },
        },
      },
    })

    if (!cart) {
      // Create cart if doesn't exist
      const newCart = await prisma.cart.create({
        data: { userId: req.user!.id },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: true,
                  price: true,
                  inStock: true,
                  stock: true,
                },
              },
            },
          },
        },
      })
      return res.json(newCart)
    }

    res.json(cart)
  } catch (error) {
    console.error('Get cart error:', error)
    res.status(500).json({ error: 'Failed to get cart' })
  }
})

// Add to cart
router.post('/items', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity = 1, variant } = req.body

    if (!productId) {
      return res.status(400).json({ error: 'Product ID required' })
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user!.id },
      })
    }

    // Check if item exists
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variant: variant || null,
      },
    })

    if (existingItem) {
      // Update quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      })
    } else {
      // Create new item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          variant: variant || null,
        },
      })
    }

    // Return updated cart
    const updatedCart = await prisma.cart.findUnique({
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
                price: true,
                inStock: true,
                stock: true,
              },
            },
          },
        },
      },
    })

    res.json(updatedCart)
  } catch (error) {
    console.error('Add to cart error:', error)
    res.status(500).json({ error: 'Failed to add to cart' })
  }
})

// Update quantity
router.put('/items/:itemId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { itemId } = req.params
    const { quantity } = req.body

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Valid quantity required' })
    }

    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: { items: true },
    })

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' })
    }

    // Check if item belongs to user
    const item = cart.items.find((i) => i.id === itemId)
    if (!item) {
      return res.status(404).json({ error: 'Item not found in cart' })
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    })

    res.json({ message: 'Quantity updated' })
  } catch (error) {
    console.error('Update quantity error:', error)
    res.status(500).json({ error: 'Failed to update quantity' })
  }
})

// Remove item
router.delete('/items/:itemId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { itemId } = req.params

    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: { items: true },
    })

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' })
    }

    // Check if item belongs to user
    const item = cart.items.find((i) => i.id === itemId)
    if (!item) {
      return res.status(404).json({ error: 'Item not found in cart' })
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    })

    res.json({ message: 'Item removed from cart' })
  } catch (error) {
    console.error('Remove item error:', error)
    res.status(500).json({ error: 'Failed to remove item' })
  }
})

// Clear cart
router.delete('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.cartItem.deleteMany({
      where: { cart: { userId: req.user!.id } },
    })

    res.json({ message: 'Cart cleared' })
  } catch (error) {
    console.error('Clear cart error:', error)
    res.status(500).json({ error: 'Failed to clear cart' })
  }
})

export default router

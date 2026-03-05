import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// Get addresses
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user!.id },
      orderBy: { isDefault: 'desc' },
    })
    res.json(addresses)
  } catch (error) {
    console.error('Get addresses error:', error)
    res.status(500).json({ error: 'Failed to get addresses' })
  }
})

// Create address
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, firstName, lastName, address1, address2, city, state, zip, country, phone, isDefault } = req.body

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user!.id, isDefault: true },
        data: { isDefault: false },
      })
    }

    const address = await prisma.address.create({
      data: {
        userId: req.user!.id,
        name,
        firstName,
        lastName,
        address1,
        address2,
        city,
        state,
        zip,
        country: country || 'US',
        phone,
        isDefault: isDefault || false,
      },
    })

    res.status(201).json(address)
  } catch (error) {
    console.error('Create address error:', error)
    res.status(500).json({ error: 'Failed to create address' })
  }
})

// Update address
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { name, firstName, lastName, address1, address2, city, state, zip, phone, isDefault } = req.body

    // Verify ownership
    const existing = await prisma.address.findFirst({
      where: { id, userId: req.user!.id },
    })

    if (!existing) {
      return res.status(404).json({ error: 'Address not found' })
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user!.id, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      })
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        name,
        firstName,
        lastName,
        address1,
        address2,
        city,
        state,
        zip,
        phone,
        isDefault: isDefault || existing.isDefault,
      },
    })

    res.json(address)
  } catch (error) {
    console.error('Update address error:', error)
    res.status(500).json({ error: 'Failed to update address' })
  }
})

// Delete address
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    // Verify ownership
    const existing = await prisma.address.findFirst({
      where: { id, userId: req.user!.id },
    })

    if (!existing) {
      return res.status(404).json({ error: 'Address not found' })
    }

    await prisma.address.delete({
      where: { id },
    })

    res.json({ message: 'Address deleted' })
  } catch (error) {
    console.error('Delete address error:', error)
    res.status(500).json({ error: 'Failed to delete address' })
  }
})

// Set default address
router.post('/:id/default', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    // Unset all defaults
    await prisma.address.updateMany({
      where: { userId: req.user!.id },
      data: { isDefault: false },
    })

    // Set new default
    const address = await prisma.address.update({
      where: { id },
      data: { isDefault: true },
    })

    res.json(address)
  } catch (error) {
    console.error('Set default address error:', error)
    res.status(500).json({ error: 'Failed to set default address' })
  }
})

export default router

import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, generateToken, hashPassword, comparePassword, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        phone,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    // Generate token
    const token = generateToken(user)

    // Create empty cart
    await prisma.cart.create({
      data: { userId: user.id },
    })

    res.status(201).json({ user, token })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Check password
    const validPassword = await comparePassword(password, user.passwordHash)
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Generate token
    const token = generateToken(user)

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Failed to get user' })
  }
})

// Update profile
router.put('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone } = req.body

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { name, phone },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
      },
    })

    res.json(user)
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

// Change password
router.put('/password', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' })
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const validPassword = await comparePassword(currentPassword, user.passwordHash)
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' })
    }

    const passwordHash = await hashPassword(newPassword)
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { passwordHash },
    })

    res.json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({ error: 'Failed to change password' })
  }
})

export default router

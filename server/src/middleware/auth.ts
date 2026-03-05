import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
    name: string
  }
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string
      email: string
      role: string
      name: string
    }
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next()
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string
      email: string
      role: string
      name: string
    }
    req.user = decoded
  } catch (error) {
    // Token invalid but continue anyway
  }
  
  next()
}

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

export const generateToken = (user: { id: string; email: string; role: string; name: string }) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12)
}

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash)
}

import { Router } from 'express'
import { body } from 'express-validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma'
import { validate } from '../middleware/validate'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { authLimiter } from '../middleware/rateLimiter'
import { Request, Response, NextFunction } from 'express'

export const authRouter = Router()

// GET /api/auth/hint  — public, returns name/avatar/role for a given email (no password)
// Used by the login page to show the avatar hint
authRouter.get('/hint', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = (req.query.email as string || '').toLowerCase().trim()
    if (!email) { res.json({ success: false }); return }
    const admin = await prisma.admin.findUnique({
      where: { email },
      select: { name: true, role: true, avatar: true },
    })
    if (!admin) { res.json({ success: false }); return }
    res.json({ success: true, data: admin })
  } catch (err) { next(err) }
})

// POST /api/auth/login
authRouter.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body

      const admin = await prisma.admin.findUnique({ where: { email } })
      if (!admin) {
        res.status(401).json({ success: false, message: 'Invalid credentials' })
        return
      }

      const valid = await bcrypt.compare(password, admin.password)
      if (!valid) {
        res.status(401).json({ success: false, message: 'Invalid credentials' })
        return
      }

      const secret = process.env.JWT_SECRET!
      const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as string
      const token = jwt.sign(
        { adminId: admin.id, email: admin.email, role: (admin as any).role || 'admin' },
        secret,
        { expiresIn } as any
      )

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })

      res.json({
        success: true,
        data: {
          token,
          admin: {
            id: admin.id, email: admin.email, name: admin.name,
            role: (admin as any).role || 'admin',
            avatar: (admin as any).avatar || null,
          },
        },
      })
    } catch (err) {
      next(err)
    }
  }
)

// POST /api/auth/logout
authRouter.post('/logout', (_req, res) => {
  res.clearCookie('token')
  res.json({ success: true, message: 'Logged out successfully' })
})

// GET /api/auth/me
authRouter.get('/me', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.adminId },
      select: { id: true, email: true, name: true, role: true, avatar: true, createdAt: true },
    })
    if (!admin) {
      res.status(404).json({ success: false, message: 'Admin not found' })
      return
    }
    res.json({ success: true, data: admin })
  } catch (err) {
    next(err)
  }
})

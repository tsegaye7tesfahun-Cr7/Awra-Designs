import { Router } from 'express'
import { body } from 'express-validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
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

// POST /api/auth/request-reset
authRouter.post(
  '/request-reset',
  authLimiter,
  [body('email').isEmail().normalizeEmail().withMessage('Valid email required')],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body
      const admin = await prisma.admin.findUnique({ where: { email } })

      // Always return success to prevent email enumeration
      if (!admin) {
        res.json({ success: true, message: 'If an account exists, a reset link has been sent' })
        return
      }

      // Generate reset token
      const token = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      // Delete any existing reset tokens for this admin
      await prisma.passwordReset.deleteMany({ where: { adminId: admin.id } })

      // Create new reset token
      await prisma.passwordReset.create({
        data: {
          adminId: admin.id,
          token,
          expiresAt,
        },
      })

      // In production, send email with reset link
      // For now, return the token in development
      if (process.env.NODE_ENV !== 'production') {
        res.json({
          success: true,
          message: 'Reset link generated (development mode)',
          token, // Only in development
        })
      } else {
        res.json({ success: true, message: 'If an account exists, a reset link has been sent' })
      }
    } catch (err) {
      next(err)
    }
  }
)

// POST /api/auth/reset-password
authRouter.post(
  '/reset-password',
  authLimiter,
  [
    body('token').notEmpty().withMessage('Token required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, password } = req.body

      const reset = await prisma.passwordReset.findUnique({
        where: { token },
        include: { admin: true },
      })

      if (!reset || reset.used || reset.expiresAt < new Date()) {
        res.status(400).json({ success: false, message: 'Invalid or expired reset token' })
        return
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Update admin password
      await prisma.admin.update({
        where: { id: reset.adminId },
        data: { password: hashedPassword },
      })

      // Mark token as used
      await prisma.passwordReset.update({
        where: { id: reset.id },
        data: { used: true },
      })

      res.json({ success: true, message: 'Password reset successfully' })
    } catch (err) {
      next(err)
    }
  }
)

// POST /api/auth/change-password (authenticated)
authRouter.post(
  '/change-password',
  requireAuth,
  [
    body('currentPassword').notEmpty().withMessage('Current password required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { currentPassword, newPassword } = req.body

      const admin = await prisma.admin.findUnique({ where: { id: req.adminId } })
      if (!admin) {
        res.status(404).json({ success: false, message: 'Admin not found' })
        return
      }

      const valid = await bcrypt.compare(currentPassword, admin.password)
      if (!valid) {
        res.status(401).json({ success: false, message: 'Current password is incorrect' })
        return
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10)
      await prisma.admin.update({
        where: { id: req.adminId },
        data: { password: hashedPassword },
      })

      res.json({ success: true, message: 'Password changed successfully' })
    } catch (err) {
      next(err)
    }
  }
)

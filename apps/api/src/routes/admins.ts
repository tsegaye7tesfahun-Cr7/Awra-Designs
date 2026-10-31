import { Router, Request, Response, NextFunction } from 'express'
import { body } from 'express-validator'
import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma'
import { requireAuth, requireRole } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { generalLimiter } from '../middleware/rateLimiter'
import { log } from '../lib/activityLog'

export const adminsRouter = Router()
adminsRouter.use(requireAuth)
adminsRouter.use(generalLimiter)

const SAFE_SELECT = {
  id: true, email: true, name: true,
  role: true, avatar: true, createdAt: true, updatedAt: true,
}

// GET /api/admins  — list all admin accounts (admin-only)
adminsRouter.get('/', requireRole('admin'),
  async (_req, res: Response, next: NextFunction) => {
    try {
      const admins = await prisma.admin.findMany({
        select: SAFE_SELECT,
        orderBy: { createdAt: 'asc' },
      })
      res.json({ success: true, data: admins })
    } catch (err) { next(err) }
  }
)

// POST /api/admins  — create new admin account (admin-only)
adminsRouter.post('/',
  requireRole('admin'),
  [
    body('email').trim().isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('role').optional().isIn(['admin', 'editor']).withMessage('Role must be admin or editor'),
  ],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, name, role = 'editor', avatar } = req.body
      const existing = await prisma.admin.findUnique({ where: { email } })
      if (existing) {
        res.status(409).json({ success: false, message: 'An account with this email already exists' })
        return
      }
      const hashed = await bcrypt.hash(password, 12)
      const admin = await prisma.admin.create({
        data: { email, password: hashed, name, role, avatar },
        select: SAFE_SELECT,
      })
      const r = req as any
      log({ adminId: r.adminId, adminEmail: r.adminEmail, action: 'created', entity: 'setting', entityName: `Admin: ${name} (${role})` })
      res.status(201).json({ success: true, data: admin })
    } catch (err) { next(err) }
  }
)

// GET /api/admins/me  — get own profile
adminsRouter.get('/me',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const r = req as any
      const admin = await prisma.admin.findUnique({
        where: { id: r.adminId },
        select: SAFE_SELECT,
      })
      if (!admin) { res.status(404).json({ success: false, message: 'Not found' }); return }
      res.json({ success: true, data: admin })
    } catch (err) { next(err) }
  }
)

// PUT /api/admins/me  — update own profile (name, avatar)
adminsRouter.put('/me',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('avatar').optional().trim(),
  ],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const r = req as any
      const { name, avatar } = req.body
      const data: any = {}
      if (name   !== undefined) data.name   = name
      if (avatar !== undefined) data.avatar = avatar
      const admin = await prisma.admin.update({
        where: { id: r.adminId },
        data,
        select: SAFE_SELECT,
      })
      res.json({ success: true, data: admin })
    } catch (err) { next(err) }
  }
)

// PUT /api/admins/:id  — update any admin (admin-only): name, role, avatar
adminsRouter.put('/:id',
  requireRole('admin'),
  [
    body('name').optional().trim().notEmpty(),
    body('role').optional().isIn(['admin', 'editor']).withMessage('Role must be admin or editor'),
    body('avatar').optional().trim(),
  ],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, role, avatar } = req.body
      const data: any = {}
      if (name   !== undefined) data.name   = name
      if (role   !== undefined) data.role   = role
      if (avatar !== undefined) data.avatar = avatar
      const admin = await prisma.admin.update({
        where: { id: req.params.id },
        data,
        select: SAFE_SELECT,
      })
      const r = req as any
      log({ adminId: r.adminId, adminEmail: r.adminEmail, action: 'updated', entity: 'setting', entityName: `Admin: ${admin.name}` })
      res.json({ success: true, data: admin })
    } catch (err: any) {
      if (err.code === 'P2025') { res.status(404).json({ success: false, message: 'Admin not found' }); return }
      next(err)
    }
  }
)

// DELETE /api/admins/:id  — delete admin (admin-only, cannot delete self)
adminsRouter.delete('/:id',
  requireRole('admin'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const r = req as any
      if (req.params.id === r.adminId) {
        res.status(400).json({ success: false, message: 'You cannot delete your own account' })
        return
      }
      // Ensure at least one admin remains
      const adminCount = await prisma.admin.count({ where: { role: 'admin' } })
      const target = await prisma.admin.findUnique({ where: { id: req.params.id } })
      if (target?.role === 'admin' && adminCount <= 1) {
        res.status(400).json({ success: false, message: 'Cannot delete the last admin account' })
        return
      }
      await prisma.admin.delete({ where: { id: req.params.id } })
      log({ adminId: r.adminId, adminEmail: r.adminEmail, action: 'deleted', entity: 'setting', entityName: `Admin: ${target?.name}` })
      res.json({ success: true, message: 'Account deleted' })
    } catch (err: any) {
      if (err.code === 'P2025') { res.status(404).json({ success: false, message: 'Admin not found' }); return }
      next(err)
    }
  }
)

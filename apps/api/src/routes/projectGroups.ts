import { Router, Request, Response, NextFunction } from 'express'
import { body } from 'express-validator'
import prisma from '../lib/prisma'
import { requireAuth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { generalLimiter } from '../middleware/rateLimiter'

export const projectGroupsRouter = Router()
projectGroupsRouter.use(generalLimiter)

// ── PUBLIC ─────────────────────────────────────────────────────────────────────

// GET /api/project-groups  — all groups ordered (public, used by frontend)
projectGroupsRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const groups = await prisma.projectGroup.findMany({
      orderBy: { order: 'asc' },
      select: { id: true, label: true, subcategories: true, order: true },
    })
    res.json({ success: true, data: groups })
  } catch (err) { next(err) }
})

// ── ADMIN ──────────────────────────────────────────────────────────────────────

const groupValidation = [
  body('label').trim().notEmpty().withMessage('Label is required'),
]

// GET /api/project-groups/admin/all
projectGroupsRouter.get('/admin/all', requireAuth, async (_req, res: Response, next: NextFunction) => {
  try {
    const groups = await prisma.projectGroup.findMany({ orderBy: { order: 'asc' } })
    res.json({ success: true, data: groups })
  } catch (err) { next(err) }
})

// GET /api/project-groups/:id
projectGroupsRouter.get('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const group = await prisma.projectGroup.findUnique({ where: { id: req.params.id } })
    if (!group) { res.status(404).json({ success: false, message: 'Group not found' }); return }
    res.json({ success: true, data: group })
  } catch (err) { next(err) }
})

// POST /api/project-groups
projectGroupsRouter.post('/', requireAuth, groupValidation, validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { label, subcategories = [], order = 0 } = req.body
      const group = await prisma.projectGroup.create({
        data: { label, subcategories, order },
      })
      res.status(201).json({ success: true, data: group })
    } catch (err) { next(err) }
  }
)

// PUT /api/project-groups/:id
projectGroupsRouter.put('/:id', requireAuth, groupValidation, validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { label, subcategories, order } = req.body
      const group = await prisma.projectGroup.update({
        where: { id: req.params.id },
        data: { label, subcategories, order },
      })
      res.json({ success: true, data: group })
    } catch (err: any) {
      if (err.code === 'P2025') { res.status(404).json({ success: false, message: 'Group not found' }); return }
      next(err)
    }
  }
)

// PATCH /api/project-groups/:id  — partial update (e.g. reorder)
projectGroupsRouter.patch('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allowed = ['label', 'subcategories', 'order']
    const data: any = {}
    for (const key of allowed) {
      if (key in req.body) data[key] = req.body[key]
    }
    const group = await prisma.projectGroup.update({ where: { id: req.params.id }, data })
    res.json({ success: true, data: group })
  } catch (err: any) {
    if (err.code === 'P2025') { res.status(404).json({ success: false, message: 'Group not found' }); return }
    next(err)
  }
})

// DELETE /api/project-groups/:id
projectGroupsRouter.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.projectGroup.delete({ where: { id: req.params.id } })
    res.json({ success: true, message: 'Group deleted' })
  } catch (err: any) {
    if (err.code === 'P2025') { res.status(404).json({ success: false, message: 'Group not found' }); return }
    next(err)
  }
})

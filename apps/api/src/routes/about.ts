import { Router, Request, Response, NextFunction } from 'express'
import { body } from 'express-validator'
import prisma from '../lib/prisma'
import { requireAuth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { generalLimiter } from '../middleware/rateLimiter'
import { cacheResponse, clearCache } from '../middleware/cache'

export const aboutRouter = Router()
aboutRouter.use(generalLimiter)

// GET /api/about  — public, returns the single active record (cached)
aboutRouter.get('/', cacheResponse({ ttl: 10 * 60 * 1000 }), async (_req, res: Response, next: NextFunction) => {
  try {
    const about = await prisma.about.findFirst({
      where: { isActive: true },
      include: { teamMembers: { orderBy: { order: 'asc' } } },
    })
    if (!about) { res.status(404).json({ success: false, message: 'About content not found' }); return }
    res.json({ success: true, data: about })
  } catch (err) { next(err) }
})

const aboutValidation = [
  body('headline1').trim().notEmpty().withMessage('Headline 1 is required'),
  body('headline2').trim().notEmpty().withMessage('Headline 2 is required'),
  body('tagline').trim().notEmpty().withMessage('Tagline is required'),
]

// POST /api/about  — admin, create (or replace active)
aboutRouter.post('/', requireAuth, aboutValidation, validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Deactivate existing
      await prisma.about.updateMany({ where: { isActive: true }, data: { isActive: false } })
      const { teamMembers: members, slideImages: _si, ...data } = req.body
      const cleanMembers = members?.map(({ id: _id, aboutId: _ab, ...m }: any) => m) ?? []
      const about = await prisma.about.create({
        data: {
          ...data,
          isActive: true,
          teamMembers: cleanMembers.length
            ? { create: cleanMembers }
            : undefined,
        },
        include: { teamMembers: true },
      })
      // Clear cache after update
      clearCache('/api/about')
      res.status(201).json({ success: true, data: about })
    } catch (err) { next(err) }
  }
)

// PUT /api/about/:id  — admin, update
aboutRouter.put('/:id', requireAuth, aboutValidation, validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { teamMembers: members, slideImages: _si, ...data } = req.body
      // Replace team members — strip id/aboutId so Prisma doesn't try to set them on create
      const cleanMembers = members?.map(({ id: _id, aboutId: _ab, ...m }: any) => m) ?? []
      await prisma.teamMember.deleteMany({ where: { aboutId: req.params.id } })
      const about = await prisma.about.update({
        where: { id: req.params.id },
        data: {
          ...data,
          teamMembers: cleanMembers.length
            ? { create: cleanMembers }
            : undefined,
        },
        include: { teamMembers: { orderBy: { order: 'asc' } } },
      })
      res.json({ success: true, data: about })
    } catch (err: any) {
      if (err.code === 'P2025') { res.status(404).json({ success: false, message: 'About record not found' }); return }
      next(err)
    }
  }
)

// GET /api/about/admin/all  — admin, list all versions
aboutRouter.get('/admin/all', requireAuth, async (_req, res: Response, next: NextFunction) => {
  try {
    const records = await prisma.about.findMany({
      include: { teamMembers: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ success: true, data: records })
  } catch (err) { next(err) }
})

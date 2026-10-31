import { Router, Request, Response, NextFunction } from 'express'
import { body } from 'express-validator'
import prisma from '../lib/prisma'
import { requireAuth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { generalLimiter } from '../middleware/rateLimiter'

export const testimonialsRouter = Router()
testimonialsRouter.use(generalLimiter)

// GET /api/testimonials  — public, published only
testimonialsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const featured = req.query.featured === 'true'
    const where: any = { isPublished: true }
    if (featured) where.isFeatured = true

    const items = await prisma.testimonial.findMany({
      where,
      orderBy: { order: 'asc' },
    })
    res.json({ success: true, data: items })
  } catch (err) { next(err) }
})

const tValidation = [
  body('clientName').trim().notEmpty().withMessage('Client name is required'),
  body('position').trim().notEmpty().withMessage('Position is required'),
  body('text').trim().notEmpty().withMessage('Testimonial text is required'),
]

// GET /api/testimonials/admin/all
testimonialsRouter.get('/admin/all', requireAuth, async (_req, res: Response, next: NextFunction) => {
  try {
    const items = await prisma.testimonial.findMany({ orderBy: { order: 'asc' } })
    res.json({ success: true, data: items })
  } catch (err) { next(err) }
})

// GET /api/testimonials/:id
testimonialsRouter.get('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await prisma.testimonial.findUnique({ where: { id: req.params.id } })
    if (!item) { res.status(404).json({ success: false, message: 'Testimonial not found' }); return }
    res.json({ success: true, data: item })
  } catch (err) { next(err) }
})

// POST /api/testimonials
testimonialsRouter.post('/', requireAuth, tValidation, validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { clientName, position, company, text, imageUrl, rating, isFeatured, isPublished, order } = req.body
      const data: any = {
        clientName, position, text,
        company:    company    || null,
        imageUrl:   imageUrl   || null,
        isFeatured: !!isFeatured,
        isPublished: !!isPublished,
        order:      typeof order === 'number' ? order : 0,
        rating:     rating !== '' && rating != null ? parseInt(rating) : null,
      }
      const item = await prisma.testimonial.create({ data })
      res.status(201).json({ success: true, data: item })
    } catch (err) { next(err) }
  }
)

// PUT /api/testimonials/:id
testimonialsRouter.put('/:id', requireAuth, tValidation, validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { clientName, position, company, text, imageUrl, rating, isFeatured, isPublished, order } = req.body
      const data: any = {
        clientName, position, text,
        company:    company    || null,
        imageUrl:   imageUrl   || null,
        isFeatured: !!isFeatured,
        isPublished: !!isPublished,
        order:      typeof order === 'number' ? order : 0,
        rating:     rating !== '' && rating != null ? parseInt(rating) : null,
      }
      const item = await prisma.testimonial.update({ where: { id: req.params.id }, data })
      res.json({ success: true, data: item })
    } catch (err: any) {
      if (err.code === 'P2025') { res.status(404).json({ success: false, message: 'Testimonial not found' }); return }
      next(err)
    }
  }
)

// PATCH /api/testimonials/:id
testimonialsRouter.patch('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allowed = ['isPublished', 'isFeatured', 'order']
    const data: any = {}
    for (const key of allowed) {
      if (key in req.body) data[key] = req.body[key]
    }
    const item = await prisma.testimonial.update({ where: { id: req.params.id }, data })
    res.json({ success: true, data: item })
  } catch (err: any) {
    if (err.code === 'P2025') { res.status(404).json({ success: false, message: 'Testimonial not found' }); return }
    next(err)
  }
})

// DELETE /api/testimonials/:id
testimonialsRouter.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.testimonial.delete({ where: { id: req.params.id } })
    res.json({ success: true, message: 'Testimonial deleted' })
  } catch (err: any) {
    if (err.code === 'P2025') { res.status(404).json({ success: false, message: 'Testimonial not found' }); return }
    next(err)
  }
})

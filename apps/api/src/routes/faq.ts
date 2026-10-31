import { Router, Request, Response, NextFunction } from 'express'
import { body } from 'express-validator'
import prisma from '../lib/prisma'
import { requireAuth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { generalLimiter } from '../middleware/rateLimiter'

export const faqRouter = Router()
faqRouter.use(generalLimiter)

// ── PUBLIC ─────────────────────────────────────────────────────────────────────

// GET /api/faq  — published only, ordered
faqRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category } = req.query
    const where: any = { isPublished: true }
    if (category) where.category = category

    const items = await prisma.faqItem.findMany({
      where,
      orderBy: { order: 'asc' },
      select: { id: true, question: true, answer: true, category: true, order: true },
    })
    res.json({ success: true, data: items })
  } catch (err) { next(err) }
})

// ── ADMIN ──────────────────────────────────────────────────────────────────────

const faqValidation = [
  body('question').trim().notEmpty().withMessage('Question is required'),
  body('answer').trim().notEmpty().withMessage('Answer is required'),
]

// GET /api/faq/admin/all
faqRouter.get('/admin/all', requireAuth, async (_req, res: Response, next: NextFunction) => {
  try {
    const items = await prisma.faqItem.findMany({ orderBy: { order: 'asc' } })
    res.json({ success: true, data: items })
  } catch (err) { next(err) }
})

// GET /api/faq/:id
faqRouter.get('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await prisma.faqItem.findUnique({ where: { id: req.params.id } })
    if (!item) { res.status(404).json({ success: false, message: 'FAQ item not found' }); return }
    res.json({ success: true, data: item })
  } catch (err) { next(err) }
})

// POST /api/faq
faqRouter.post('/', requireAuth, faqValidation, validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { question, answer, category, order, isPublished } = req.body
      const item = await prisma.faqItem.create({
        data: {
          question:    question.trim(),
          answer:      answer.trim(),
          category:    category?.trim() || null,
          order:       typeof order === 'number' ? order : parseInt(order) || 0,
          isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
        },
      })
      res.status(201).json({ success: true, data: item })
    } catch (err) { next(err) }
  }
)

// PUT /api/faq/:id
faqRouter.put('/:id', requireAuth, faqValidation, validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { question, answer, category, order, isPublished } = req.body
      const item = await prisma.faqItem.update({
        where: { id: req.params.id },
        data: {
          question:    question.trim(),
          answer:      answer.trim(),
          category:    category?.trim() || null,
          order:       typeof order === 'number' ? order : parseInt(order) || 0,
          isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
        },
      })
      res.json({ success: true, data: item })
    } catch (err: any) {
      if (err.code === 'P2025') { res.status(404).json({ success: false, message: 'FAQ item not found' }); return }
      next(err)
    }
  }
)

// PATCH /api/faq/:id  — toggle publish / update order
faqRouter.patch('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allowed = ['isPublished', 'order']
    const data: any = {}
    for (const key of allowed) {
      if (key in req.body) data[key] = req.body[key]
    }
    const item = await prisma.faqItem.update({ where: { id: req.params.id }, data })
    res.json({ success: true, data: item })
  } catch (err: any) {
    if (err.code === 'P2025') { res.status(404).json({ success: false, message: 'FAQ item not found' }); return }
    next(err)
  }
})

// DELETE /api/faq/:id
faqRouter.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.faqItem.delete({ where: { id: req.params.id } })
    res.json({ success: true, message: 'FAQ item deleted' })
  } catch (err: any) {
    if (err.code === 'P2025') { res.status(404).json({ success: false, message: 'FAQ item not found' }); return }
    next(err)
  }
})

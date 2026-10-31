import { Router, Request, Response, NextFunction } from 'express'
import { body, param, query } from 'express-validator'
import slugify from 'slugify'
import prisma from '../lib/prisma'
import { requireAuth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { generalLimiter } from '../middleware/rateLimiter'
import { log } from '../lib/activityLog'

export const projectsRouter = Router()
projectsRouter.use(generalLimiter)

// ── PUBLIC ─────────────────────────────────────────────────────────────────────

// GET /api/projects  (published only, optional ?category=&featured=true)
projectsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, featured } = req.query
    const where: any = { isPublished: true }
    if (category) where.category = category
    if (featured === 'true') where.isFeatured = true

    const projects = await prisma.project.findMany({
      where,
      orderBy: { order: 'asc' },
    })
    res.json({ success: true, data: projects })
  } catch (err) { next(err) }
})

// GET /api/projects/slug/:slug
projectsRouter.get('/slug/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.findFirst({
      where: { slug: req.params.slug, isPublished: true },
    })
    if (!project) { res.status(404).json({ success: false, message: 'Project not found' }); return }
    res.json({ success: true, data: project })
  } catch (err) { next(err) }
})

// ── ADMIN ──────────────────────────────────────────────────────────────────────

const projectValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('filter').trim().notEmpty().withMessage('Filter is required'),
  body('shortDescription').trim().notEmpty().withMessage('Short description is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('coverImage').trim().notEmpty().withMessage('Cover image URL is required'),
  body('year').trim().notEmpty().withMessage('Year is required'),
  body('type').trim().notEmpty().withMessage('Type is required'),
]

// GET /api/projects/admin/all  (all projects, admin)
projectsRouter.get('/admin/all', requireAuth, async (_req, res: Response, next: NextFunction) => {
  try {
    const projects = await prisma.project.findMany({ orderBy: { order: 'asc' } })
    res.json({ success: true, data: projects })
  } catch (err) { next(err) }
})

// GET /api/projects/:id  (admin — single by id)
projectsRouter.get('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } })
    if (!project) { res.status(404).json({ success: false, message: 'Project not found' }); return }
    res.json({ success: true, data: project })
  } catch (err) { next(err) }
})

// POST /api/projects
projectsRouter.post('/', requireAuth, projectValidation, validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        title, category, filter, shortDescription, description,
        coverImage, galleryImages, client, year, type,
        services, isFeatured, isPublished: rawPublished,
        scheduledAt: rawScheduled, order, seoTitle, seoDesc,
      } = req.body
      const slug        = slugify(title, { lower: true, strict: true })
      const scheduledAt = rawScheduled ? new Date(rawScheduled) : null
      const isPublished = scheduledAt ? false : Boolean(rawPublished)
      const project = await prisma.project.create({
        data: {
          title:            title.trim(),
          slug,
          category:         category.trim(),
          filter:           filter.trim(),
          shortDescription: shortDescription.trim(),
          description:      description.trim(),
          coverImage:       coverImage.trim(),
          galleryImages:    Array.isArray(galleryImages) ? galleryImages.filter(Boolean) : [],
          client:           client?.trim()    || null,
          year:             year.trim(),
          type:             type.trim(),
          services:         Array.isArray(services) ? services.filter(Boolean) : [],
          isFeatured:       Boolean(isFeatured),
          isPublished,
          order:            typeof order === 'number' ? order : parseInt(order) || 0,
          seoTitle:         seoTitle?.trim()  || null,
          seoDesc:          seoDesc?.trim()   || null,
        } as any,
      })
      const r = req as any
      log({ adminId: r.adminId, adminEmail: r.adminEmail, action: 'created', entity: 'project', entityId: project.id, entityName: project.title })
      res.status(201).json({ success: true, data: project })
    } catch (err: any) {
      if (err.code === 'P2002') {
        res.status(409).json({ success: false, message: 'A project with this title already exists' })
        return
      }
      next(err)
    }
  }
)

// PUT /api/projects/:id
projectsRouter.put('/:id', requireAuth, projectValidation, validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        title, category, filter, shortDescription, description,
        coverImage, galleryImages, client, year, type,
        services, isFeatured, isPublished: rawPublished,
        scheduledAt: rawScheduled, order, seoTitle, seoDesc,
      } = req.body
      const slug        = slugify(title, { lower: true, strict: true })
      const scheduledAt = rawScheduled ? new Date(rawScheduled) : null
      const isPublished = scheduledAt ? false : Boolean(rawPublished)
      const project = await prisma.project.update({
        where: { id: req.params.id },
        data: {
          title:            title.trim(),
          slug,
          category:         category.trim(),
          filter:           filter.trim(),
          shortDescription: shortDescription.trim(),
          description:      description.trim(),
          coverImage:       coverImage.trim(),
          galleryImages:    Array.isArray(galleryImages) ? galleryImages.filter(Boolean) : [],
          client:           client?.trim()    || null,
          year:             year.trim(),
          type:             type.trim(),
          services:         Array.isArray(services) ? services.filter(Boolean) : [],
          isFeatured:       Boolean(isFeatured),
          isPublished,
          order:            typeof order === 'number' ? order : parseInt(order) || 0,
          seoTitle:         seoTitle?.trim()  || null,
          seoDesc:          seoDesc?.trim()   || null,
        } as any,
      })
      const r = req as any
      log({ adminId: r.adminId, adminEmail: r.adminEmail, action: 'updated', entity: 'project', entityId: project.id, entityName: project.title })
      res.json({ success: true, data: project })
    } catch (err: any) {
      if (err.code === 'P2025') { res.status(404).json({ success: false, message: 'Project not found' }); return }
      next(err)
    }
  }
)

// PATCH /api/projects/:id  (partial update: publish, feature, order)
projectsRouter.patch('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allowed = ['isPublished', 'isFeatured', 'order']
    const data: any = {}
    for (const key of allowed) {
      if (key in req.body) data[key] = req.body[key]
    }
    const project = await prisma.project.update({ where: { id: req.params.id }, data })
    const r = req as any
    if ('isPublished' in req.body) {
      log({ adminId: r.adminId, adminEmail: r.adminEmail, action: req.body.isPublished ? 'published' : 'unpublished', entity: 'project', entityId: project.id, entityName: project.title })
    }
    if ('isFeatured' in req.body) {
      log({ adminId: r.adminId, adminEmail: r.adminEmail, action: req.body.isFeatured ? 'featured' : 'unfeatured', entity: 'project', entityId: project.id, entityName: project.title })
    }
    res.json({ success: true, data: project })
  } catch (err: any) {
    if (err.code === 'P2025') { res.status(404).json({ success: false, message: 'Project not found' }); return }
    next(err)
  }
})

// DELETE /api/projects/:id
projectsRouter.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id }, select: { title: true } })
    await prisma.project.delete({ where: { id: req.params.id } })
    const r = req as any
    log({ adminId: r.adminId, adminEmail: r.adminEmail, action: 'deleted', entity: 'project', entityId: req.params.id, entityName: project?.title })
    res.json({ success: true, message: 'Project deleted' })
  } catch (err: any) {
    if (err.code === 'P2025') { res.status(404).json({ success: false, message: 'Project not found' }); return }
    next(err)
  }
})

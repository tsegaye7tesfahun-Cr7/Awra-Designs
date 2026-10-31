import { Router, Response, NextFunction } from 'express'
import prisma from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { validateCSRFToken } from '../middleware/csrf'
import { perUserRateLimit } from '../middleware/rateLimiter'
import { log } from '../lib/activityLog'

export const adminRouter = Router()
adminRouter.use(requireAuth)

// Apply per-user rate limiting for authenticated admin users
adminRouter.use(perUserRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 minutes per user
}))

// Validate CSRF for state-changing methods (POST, PUT, PATCH, DELETE)
adminRouter.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return validateCSRFToken(req, res, next)
  }
  next()
})

// GET /api/admin/dashboard  — overview stats
adminRouter.get('/dashboard', async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [
      totalProjects,
      publishedProjects,
      featuredProjects,
      totalBlogPosts,
      publishedBlogPosts,
      totalTestimonials,
      publishedTestimonials,
      totalMessages,
      unreadMessages,
    ] = await prisma.$transaction([
      prisma.project.count(),
      prisma.project.count({ where: { isPublished: true } }),
      prisma.project.count({ where: { isFeatured: true } }),
      prisma.blogPost.count(),
      prisma.blogPost.count({ where: { isPublished: true } }),
      prisma.testimonial.count(),
      prisma.testimonial.count({ where: { isPublished: true } }),
      prisma.contactMessage.count({ where: { isArchived: false } }),
      prisma.contactMessage.count({ where: { isRead: false, isArchived: false } }),
    ])

    res.json({
      success: true,
      data: {
        projects: { total: totalProjects, published: publishedProjects, featured: featuredProjects },
        blog: { total: totalBlogPosts, published: publishedBlogPosts },
        testimonials: { total: totalTestimonials, published: publishedTestimonials },
        messages: { total: totalMessages, unread: unreadMessages },
      },
    })
  } catch (err) { next(err) }
})

// GET /api/admin/activity  — paginated activity log
adminRouter.get('/activity', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page  = Math.max(1, parseInt(req.query?.page as string) || 1)
    const limit = Math.min(100, parseInt(req.query?.limit as string) || 50)
    const skip  = (page - 1) * limit
    const entity = req.query?.entity as string | undefined

    const where = entity ? { entity } : {}

    const [total, logs] = await prisma.$transaction([
      prisma.activityLog.count({ where }),
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ])

    res.json({
      success: true,
      data: logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (err) { next(err) }
})

// GET /api/admin/analytics  — time-series data for charts
adminRouter.get('/analytics', async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const now = new Date()

    // ── Messages per week — last 8 weeks ─────────────────────────────────────
    const weeksBack = 8
    const weekStart = new Date(now)
    weekStart.setDate(weekStart.getDate() - weeksBack * 7)

    const messages = await prisma.contactMessage.findMany({
      where: { createdAt: { gte: weekStart } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    })

    // Build week buckets: label = "Mon DD MMM"
    const weekBuckets: { label: string; count: number }[] = []
    for (let w = weeksBack - 1; w >= 0; w--) {
      const start = new Date(now)
      start.setDate(start.getDate() - (w + 1) * 7)
      start.setHours(0, 0, 0, 0)
      const end = new Date(start)
      end.setDate(end.getDate() + 7)

      const count = messages.filter(m => m.createdAt >= start && m.createdAt < end).length
      const label = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
      weekBuckets.push({ label, count })
    }

    // ── Projects created per month — last 6 months ────────────────────────────
    const monthsBack = 6
    const monthStart = new Date(now.getFullYear(), now.getMonth() - monthsBack + 1, 1)

    const projects = await prisma.project.findMany({
      where: { createdAt: { gte: monthStart } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    })

    const monthBuckets: { label: string; count: number }[] = []
    for (let m = monthsBack - 1; m >= 0; m--) {
      const d = new Date(now.getFullYear(), now.getMonth() - m, 1)
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1)
      const count = projects.filter(p => p.createdAt >= d && p.createdAt < end).length
      const label = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
      monthBuckets.push({ label, count })
    }

    // ── Blog posts per month — last 6 months ──────────────────────────────────
    const posts = await prisma.blogPost.findMany({
      where: { createdAt: { gte: monthStart } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    })

    const postBuckets: { label: string; count: number }[] = []
    for (let m = monthsBack - 1; m >= 0; m--) {
      const d = new Date(now.getFullYear(), now.getMonth() - m, 1)
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1)
      const count = posts.filter(p => p.createdAt >= d && p.createdAt < end).length
      const label = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
      postBuckets.push({ label, count })
    }

    res.json({
      success: true,
      data: {
        messagesPerWeek:   weekBuckets,
        projectsPerMonth:  monthBuckets,
        postsPerMonth:     postBuckets,
      },
    })
  } catch (err) { next(err) }
})

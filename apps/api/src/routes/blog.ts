import { Router, Request, Response, NextFunction } from 'express'
import { body, query } from 'express-validator'
import slugify from 'slugify'
import prisma from '../lib/prisma'
import { requireAuth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { generalLimiter } from '../middleware/rateLimiter'
import { log } from '../lib/activityLog'

export const blogRouter = Router()
blogRouter.use(generalLimiter)

// RSS Feed
blogRouter.get('/rss', async (req: Request, res: Response) => {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      take: 50,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        coverImage: true,
        category: true,
        tags: true,
        author: true,
        publishedAt: true,
        updatedAt: true,
      },
    })

    const baseUrl = 'https://awradesigns.com'
    const rssDate = new Date().toUTCString()

    let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Awra Designs Blog</title>
    <description>Architecture and Design Insights from Awra Designs</description>
    <link>${baseUrl}/</link>
    <atom:link href="${baseUrl}/api/blog/rss" rel="self" type="application/rss+xml" />
    <language>en-us</language>
    <lastBuildDate>${rssDate}</lastBuildDate>
`

    posts.forEach(post => {
      const pubDate = post.publishedAt ? new Date(post.publishedAt).toUTCString() : new Date().toUTCString()
      const postUrl = `${baseUrl}/blog/${post.slug}`
      const categories = post.tags && post.tags.length > 0 ? post.tags.join(', ') : post.category || 'General'
      
      // Strip HTML tags from content for description
      const plainContent = post.content?.replace(/<[^>]*>/g, '').substring(0, 500) || post.excerpt || ''

      rss += `    <item>
      <title>${post.title}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description><![CDATA[${plainContent}]]></description>
      <category>${categories}</category>
      <author>${post.author || 'Awra Designs'}</author>
      <pubDate>${pubDate}</pubDate>
    </item>
`
    })

    rss += `  </channel>
</rss>`

    res.set('Content-Type', 'application/rss+xml')
    res.send(rss)
  } catch (error) {
    console.error('RSS feed error:', error)
    res.status(500).json({ success: false, error: 'Failed to generate RSS feed' })
  }
})

// ── PUBLIC ─────────────────────────────────────────────────────────────────────

// GET /api/blog  — published only, supports ?page=1&limit=10&category=&search=
blogRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(50, parseInt(req.query.limit as string) || 10)
    const skip = (page - 1) * limit
    const category = req.query.category as string | undefined
    const search = req.query.search as string | undefined

    const where: any = { isPublished: true }
    if (category) where.category = category
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [total, posts] = await prisma.$transaction([
      prisma.blogPost.count({ where }),
      prisma.blogPost.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true, title: true, slug: true, excerpt: true,
          content: true, coverImage: true, category: true, tags: true,
          author: true, readTime: true, publishedAt: true,
          seoTitle: true, seoDesc: true, ogImage: true,
        },
      }),
    ])

    res.json({
      success: true,
      data: posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (err) { next(err) }
})

// GET /api/blog/slug/:slug  — public single post
blogRouter.get('/slug/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await prisma.blogPost.findFirst({
      where: { slug: req.params.slug, isPublished: true },
    })
    if (!post) { res.status(404).json({ success: false, message: 'Post not found' }); return }
    res.json({ success: true, data: post })
  } catch (err) { next(err) }
})

// ── ADMIN ──────────────────────────────────────────────────────────────────────

const blogValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('excerpt').trim().notEmpty().withMessage('Excerpt is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
]

// GET /api/blog/admin/all
blogRouter.get('/admin/all', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20)
    const skip = (page - 1) * limit
    const [total, posts] = await prisma.$transaction([
      prisma.blogPost.count(),
      prisma.blogPost.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ])
    res.json({
      success: true,
      data: posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (err) { next(err) }
})

// GET /api/blog/:id  — admin single
blogRouter.get('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await prisma.blogPost.findUnique({ where: { id: req.params.id } })
    if (!post) { res.status(404).json({ success: false, message: 'Post not found' }); return }
    res.json({ success: true, data: post })
  } catch (err) { next(err) }
})

// POST /api/blog
blogRouter.post('/', requireAuth, blogValidation, validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        title, excerpt, content, coverImage, category,
        tags, author, readTime, isPublished: rawPublished,
        scheduledAt: rawScheduled, seoTitle, seoDesc, ogImage,
      } = req.body
      const slug        = slugify(title, { lower: true, strict: true })
      const scheduledAt = rawScheduled ? new Date(rawScheduled) : null
      const isPublished = scheduledAt ? false : Boolean(rawPublished)
      const publishedAt = isPublished && !scheduledAt ? new Date() : null
      const post = await prisma.blogPost.create({
        data: {
          title:       title.trim(),
          slug,
          excerpt:     excerpt.trim(),
          content:     content.trim(),
          coverImage:  coverImage?.trim()  || null,
          category:    category.trim(),
          tags:        Array.isArray(tags) ? tags.filter(Boolean) : [],
          author:      author?.trim()      || 'Awra Designs',
          readTime:    readTime?.trim()    || null,
          isPublished,
          publishedAt,
          seoTitle:    seoTitle?.trim()    || null,
          seoDesc:     seoDesc?.trim()     || null,
          ogImage:     ogImage?.trim()     || null,
        } as any,
      })
      const r = req as any
      log({ adminId: r.adminId, adminEmail: r.adminEmail, action: 'created', entity: 'blog_post', entityId: post.id, entityName: post.title })
      res.status(201).json({ success: true, data: post })
    } catch (err: any) {
      if (err.code === 'P2002') { res.status(409).json({ success: false, message: 'A post with this title already exists' }); return }
      next(err)
    }
  }
)

// PUT /api/blog/:id
blogRouter.put('/:id', requireAuth, blogValidation, validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        title, excerpt, content, coverImage, category,
        tags, author, readTime, isPublished: rawPublished,
        scheduledAt: rawScheduled, seoTitle, seoDesc, ogImage,
      } = req.body
      const slug        = slugify(title, { lower: true, strict: true })
      const existing    = await prisma.blogPost.findUnique({ where: { id: req.params.id } })
      const scheduledAt = rawScheduled ? new Date(rawScheduled) : null
      const isPublished = scheduledAt ? false : Boolean(rawPublished)
      const publishedAt = isPublished && !existing?.publishedAt ? new Date() : existing?.publishedAt ?? null
      const post = await prisma.blogPost.update({
        where: { id: req.params.id },
        data: {
          title:       title.trim(),
          slug,
          excerpt:     excerpt.trim(),
          content:     content.trim(),
          coverImage:  coverImage?.trim()  || null,
          category:    category.trim(),
          tags:        Array.isArray(tags) ? tags.filter(Boolean) : [],
          author:      author?.trim()      || 'Awra Designs',
          readTime:    readTime?.trim()    || null,
          isPublished,
          publishedAt,
          seoTitle:    seoTitle?.trim()    || null,
          seoDesc:     seoDesc?.trim()     || null,
          ogImage:     ogImage?.trim()     || null,
        } as any,
      })
      const r = req as any
      log({ adminId: r.adminId, adminEmail: r.adminEmail, action: 'updated', entity: 'blog_post', entityId: post.id, entityName: post.title })
      res.json({ success: true, data: post })
    } catch (err: any) {
      if (err.code === 'P2025') { res.status(404).json({ success: false, message: 'Post not found' }); return }
      next(err)
    }
  }
)

// PATCH /api/blog/:id
blogRouter.patch('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: any = {}
    if ('isPublished' in req.body) {
      data.isPublished = req.body.isPublished
      if (req.body.isPublished) data.publishedAt = new Date()
    }
    const post = await prisma.blogPost.update({ where: { id: req.params.id }, data })
    const r = req as any
    if ('isPublished' in req.body) {
      log({ adminId: r.adminId, adminEmail: r.adminEmail, action: req.body.isPublished ? 'published' : 'unpublished', entity: 'blog_post', entityId: post.id, entityName: post.title })
    }
    res.json({ success: true, data: post })
  } catch (err: any) {
    if (err.code === 'P2025') { res.status(404).json({ success: false, message: 'Post not found' }); return }
    next(err)
  }
})

// DELETE /api/blog/:id
blogRouter.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await prisma.blogPost.findUnique({ where: { id: req.params.id }, select: { title: true } })
    await prisma.blogPost.delete({ where: { id: req.params.id } })
    const r = req as any
    log({ adminId: r.adminId, adminEmail: r.adminEmail, action: 'deleted', entity: 'blog_post', entityId: req.params.id, entityName: post?.title })
    res.json({ success: true, message: 'Post deleted' })
  } catch (err: any) {
    if (err.code === 'P2025') { res.status(404).json({ success: false, message: 'Post not found' }); return }
    next(err)
  }
})

import { Router, Request, Response, NextFunction } from 'express'
import { createHash } from 'crypto'
import prisma from '../lib/prisma'
import { requireAuth } from '../middleware/auth'
import { generalLimiter } from '../middleware/rateLimiter'

export const analyticsRouter = Router()

// ── Helpers ───────────────────────────────────────────────────────────────────

const BOT_PATTERNS = /bot|crawl|spider|headless|phantom|selenium|puppeteer|wget|curl|python|go-http|java|ruby|perl|libwww|httpclient|apache-httpclient|okhttp|axios|node-fetch|postman|insomnia/i

function isBot(ua: string): boolean {
  return BOT_PATTERNS.test(ua)
}

function hashVisitor(ip: string, ua: string): string {
  return createHash('sha256').update(`${ip}:${ua}`).digest('hex').slice(0, 32)
}

function detectDevice(ua: string): string {
  if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua)) return 'mobile'
  if (/ipad|tablet/i.test(ua)) return 'tablet'
  return 'desktop'
}

function detectBrowser(ua: string): string {
  if (/edg\//i.test(ua))    return 'Edge'
  if (/opr\//i.test(ua))    return 'Opera'
  if (/chrome/i.test(ua))   return 'Chrome'
  if (/safari/i.test(ua))   return 'Safari'
  if (/firefox/i.test(ua))  return 'Firefox'
  if (/msie|trident/i.test(ua)) return 'IE'
  return 'Other'
}

function detectOS(ua: string): string {
  if (/windows nt/i.test(ua)) return 'Windows'
  if (/mac os x/i.test(ua))   return 'macOS'
  if (/android/i.test(ua))    return 'Android'
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS'
  if (/linux/i.test(ua))      return 'Linux'
  return 'Other'
}

function detectSource(referrer: string | undefined): string {
  if (!referrer) return 'direct'
  if (/google\./i.test(referrer))   return 'google'
  if (/bing\./i.test(referrer))     return 'bing'
  if (/facebook\.|instagram\.|tiktok\.|twitter\.|t\.co|linkedin\./i.test(referrer)) return 'social'
  return 'referral'
}

function getIP(req: Request): string {
  const fwd = req.headers['x-forwarded-for']
  if (fwd) return (Array.isArray(fwd) ? fwd[0] : fwd.split(',')[0]).trim()
  return req.ip || '0.0.0.0'
}

// Simple in-memory cache for heavy queries (5 min TTL)
const cache = new Map<string, { data: any; expires: number }>()
function fromCache(key: string) {
  const entry = cache.get(key)
  if (entry && entry.expires > Date.now()) return entry.data
  return null
}
function toCache(key: string, data: any, ttlMs = 5 * 60 * 1000) {
  cache.set(key, { data, expires: Date.now() + ttlMs })
}

// ── PUBLIC: record page view ──────────────────────────────────────────────────
analyticsRouter.post('/pageview', generalLimiter, async (req: Request, res: Response) => {
  res.json({ success: true }) // respond immediately
  try {
    const ua = req.headers['user-agent'] || ''
    if (isBot(ua)) return
    const ip        = getIP(req)
    const visitorId = hashVisitor(ip, ua)
    const { sessionId, section, projectId, blogPostId, referrer, language,
            screenWidth, screenHeight, duration, scrollDepth } = req.body

    if (!sessionId) return

    const now   = new Date()
    const ago30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const existing = await (prisma as any).pageView.findFirst({
      where: { visitorId, createdAt: { gte: ago30 } },
      select: { id: true },
    })

    await (prisma as any).pageView.create({
      data: {
        visitorId,
        sessionId,
        section:      section     || null,
        projectId:    projectId   || null,
        blogPostId:   blogPostId  || null,
        referrer:     referrer    || null,
        source:       detectSource(referrer),
        device:       detectDevice(ua),
        browser:      detectBrowser(ua),
        os:           detectOS(ua),
        language:     language    || null,
        screenWidth:  screenWidth  ? Number(screenWidth)  : null,
        screenHeight: screenHeight ? Number(screenHeight) : null,
        duration:     duration     ? Number(duration)     : null,
        scrollDepth:  scrollDepth  ? Number(scrollDepth)  : null,
        isNew:        !existing,
      },
    })
  } catch { /* silent */ }
})

// ── PUBLIC: record conversion event ──────────────────────────────────────────
analyticsRouter.post('/event', generalLimiter, async (req: Request, res: Response) => {
  res.json({ success: true })
  try {
    const ua = req.headers['user-agent'] || ''
    if (isBot(ua)) return
    const ip        = getIP(req)
    const visitorId = hashVisitor(ip, ua)
    const { sessionId, type, target, meta } = req.body
    if (!sessionId || !type) return
    await (prisma as any).conversionEvent.create({
      data: {
        visitorId,
        sessionId,
        type,
        target: target || null,
        meta:   meta   || null,
        device: detectDevice(ua),
      },
    })
  } catch { /* silent */ }
})

// ── ADMIN: overview ───────────────────────────────────────────────────────────
analyticsRouter.get('/overview', requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cached = fromCache('overview')
    if (cached) { res.json({ success: true, data: cached }); return }

    const now   = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const week  = new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000)
    const month = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [total, unique, newToday, thisWeek, thisMonth, totalSessions, conversionCount] =
      await Promise.all([
        (prisma as any).pageView.count(),
        (prisma as any).pageView.findMany({ distinct: ['visitorId'], select: { visitorId: true } })
          .then((r: any[]) => r.length),
        (prisma as any).pageView.count({ where: { isNew: true, createdAt: { gte: today } } }),
        (prisma as any).pageView.count({ where: { createdAt: { gte: week } } }),
        (prisma as any).pageView.count({ where: { createdAt: { gte: month } } }),
        (prisma as any).pageView.findMany({ distinct: ['sessionId'], select: { sessionId: true } })
          .then((r: any[]) => r.length),
        (prisma as any).conversionEvent.count(),
      ])

    // Avg duration & bounce rate from sessions with data
    const sessions = await (prisma as any).pageView.groupBy({
      by: ['sessionId'],
      _sum: { duration: true },
      _count: { id: true },
    })
    const sessionsWithDuration = sessions.filter((s: any) => s._sum.duration)
    const avgDuration = sessionsWithDuration.length
      ? Math.round(sessionsWithDuration.reduce((acc: number, s: any) => acc + (s._sum.duration || 0), 0) / sessionsWithDuration.length)
      : 0
    const bounced = sessions.filter((s: any) => s._count.id === 1).length
    const bounceRate = sessions.length ? Math.round((bounced / sessions.length) * 100) : 0

    const data = { total, unique, newToday, thisWeek, thisMonth, totalSessions, conversionCount, avgDuration, bounceRate }
    toCache('overview', data)
    res.json({ success: true, data })
  } catch (err) { next(err) }
})

// ── ADMIN: visitors time series ───────────────────────────────────────────────
analyticsRouter.get('/visitors', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const period = (req.query.period as string) || '7d'
    const cacheKey = `visitors_${period}`
    const cached = fromCache(cacheKey)
    if (cached) { res.json({ success: true, data: cached }); return }

    const now = new Date()
    let buckets: { label: string; start: Date; end: Date }[] = []

    if (period === '7d') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now); d.setDate(d.getDate() - i); d.setHours(0,0,0,0)
        const e = new Date(d); e.setDate(e.getDate() + 1)
        buckets.push({ label: d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' }), start: d, end: e })
      }
    } else if (period === '30d') {
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now); d.setDate(d.getDate() - i); d.setHours(0,0,0,0)
        const e = new Date(d); e.setDate(e.getDate() + 1)
        buckets.push({ label: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), start: d, end: e })
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const e = new Date(d.getFullYear(), d.getMonth() + 1, 1)
        buckets.push({ label: d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }), start: d, end: e })
      }
    }

    const data = await Promise.all(buckets.map(async b => ({
      label: b.label,
      count: await (prisma as any).pageView.count({ where: { createdAt: { gte: b.start, lt: b.end } } }),
      unique: await (prisma as any).pageView.count({ where: { isNew: true, createdAt: { gte: b.start, lt: b.end } } }),
    })))

    toCache(cacheKey, data, 2 * 60 * 1000)
    res.json({ success: true, data })
  } catch (err) { next(err) }
})

// ── ADMIN: sections ───────────────────────────────────────────────────────────
analyticsRouter.get('/sections', requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cached = fromCache('sections')
    if (cached) { res.json({ success: true, data: cached }); return }

    const rows = await (prisma as any).pageView.groupBy({
      by: ['section'],
      where: { section: { not: null } },
      _count: { id: true },
      _avg: { duration: true, scrollDepth: true },
      orderBy: { _count: { id: 'desc' } },
    })
    const data = rows.map((r: any) => ({
      section:    r.section,
      views:      r._count.id,
      avgDuration: Math.round(r._avg.duration || 0),
      avgScroll:   Math.round(r._avg.scrollDepth || 0),
    }))
    toCache('sections', data)
    res.json({ success: true, data })
  } catch (err) { next(err) }
})

// ── ADMIN: traffic sources ────────────────────────────────────────────────────
analyticsRouter.get('/sources', requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cached = fromCache('sources')
    if (cached) { res.json({ success: true, data: cached }); return }
    const rows = await (prisma as any).pageView.groupBy({
      by: ['source'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    })
    const total = rows.reduce((s: number, r: any) => s + r._count.id, 0)
    const data  = rows.map((r: any) => ({
      source: r.source || 'direct',
      count:  r._count.id,
      pct:    total ? Math.round((r._count.id / total) * 100) : 0,
    }))
    toCache('sources', data)
    res.json({ success: true, data })
  } catch (err) { next(err) }
})

// ── ADMIN: devices ────────────────────────────────────────────────────────────
analyticsRouter.get('/devices', requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cached = fromCache('devices')
    if (cached) { res.json({ success: true, data: cached }); return }
    const [devices, browsers, oss] = await Promise.all([
      (prisma as any).pageView.groupBy({ by: ['device'],  _count: { id: true }, orderBy: { _count: { id: 'desc' } } }),
      (prisma as any).pageView.groupBy({ by: ['browser'], _count: { id: true }, orderBy: { _count: { id: 'desc' } } }),
      (prisma as any).pageView.groupBy({ by: ['os'],      _count: { id: true }, orderBy: { _count: { id: 'desc' } } }),
    ])
    const calc = (rows: any[]) => {
      const total = rows.reduce((s: number, r: any) => s + r._count.id, 0)
      return rows.map((r: any) => ({
        name: Object.values(r).find((v: any) => typeof v === 'string') as string || 'Unknown',
        count: r._count.id,
        pct:   total ? Math.round((r._count.id / total) * 100) : 0,
      }))
    }
    const data = { devices: calc(devices), browsers: calc(browsers), os: calc(oss) }
    toCache('devices', data)
    res.json({ success: true, data })
  } catch (err) { next(err) }
})

// ── ADMIN: countries ──────────────────────────────────────────────────────────
analyticsRouter.get('/countries', requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cached = fromCache('countries')
    if (cached) { res.json({ success: true, data: cached }); return }
    const rows = await (prisma as any).pageView.groupBy({
      by: ['country'],
      where: { country: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 20,
    })
    const data = rows.map((r: any) => ({ country: r.country, count: r._count.id }))
    toCache('countries', data)
    res.json({ success: true, data })
  } catch (err) { next(err) }
})

// ── ADMIN: conversions ────────────────────────────────────────────────────────
analyticsRouter.get('/conversions', requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cached = fromCache('conversions')
    if (cached) { res.json({ success: true, data: cached }); return }
    const rows = await (prisma as any).conversionEvent.groupBy({
      by: ['type'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    })
    const total = await (prisma as any).pageView.count({ distinct: ['sessionId'] })
    const data  = rows.map((r: any) => ({
      type:  r.type,
      count: r._count.id,
      rate:  total ? ((r._count.id / total) * 100).toFixed(1) : '0',
    }))
    toCache('conversions', data)
    res.json({ success: true, data })
  } catch (err) { next(err) }
})

// ── ADMIN: live visitors (last 5 min) ─────────────────────────────────────────
analyticsRouter.get('/live', requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const since = new Date(Date.now() - 5 * 60 * 1000)
    const [activeVisitors, recentSessions, latestEvents] = await Promise.all([
      (prisma as any).pageView.findMany({
        where: { createdAt: { gte: since } },
        distinct: ['visitorId'],
        select: { visitorId: true },
      }).then((r: any[]) => r.length),
      (prisma as any).pageView.findMany({
        where: { createdAt: { gte: since } },
        distinct: ['sessionId'],
        select: { sessionId: true },
      }).then((r: any[]) => r.length),
      (prisma as any).pageView.findMany({
        where: { createdAt: { gte: since } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { section: true, device: true, country: true, source: true, createdAt: true },
      }),
    ])
    res.json({ success: true, data: { activeVisitors, activeSessions: recentSessions, recentEvents: latestEvents } })
  } catch (err) { next(err) }
})

// ── ADMIN: top projects ───────────────────────────────────────────────────────
analyticsRouter.get('/top-projects', requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await (prisma as any).pageView.groupBy({
      by: ['projectId'],
      where: { projectId: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    })
    // Enrich with project titles
    const ids = rows.map((r: any) => r.projectId)
    const projects = await prisma.project.findMany({
      where: { id: { in: ids } },
      select: { id: true, title: true, coverImage: true },
    })
    const data = rows.map((r: any) => {
      const p = projects.find((pr: any) => pr.id === r.projectId)
      return { projectId: r.projectId, title: p?.title || 'Unknown', coverImage: p?.coverImage, views: r._count.id }
    })
    res.json({ success: true, data })
  } catch (err) { next(err) }
})

// ── ADMIN: top blog posts ─────────────────────────────────────────────────────
analyticsRouter.get('/top-posts', requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await (prisma as any).pageView.groupBy({
      by: ['blogPostId'],
      where: { blogPostId: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    })
    const ids   = rows.map((r: any) => r.blogPostId)
    const posts = await prisma.blogPost.findMany({
      where: { id: { in: ids } },
      select: { id: true, title: true },
    })
    const data = rows.map((r: any) => {
      const p = posts.find((pp: any) => pp.id === r.blogPostId)
      return { postId: r.blogPostId, title: p?.title || 'Unknown', views: r._count.id }
    })
    res.json({ success: true, data })
  } catch (err) { next(err) }
})

// ── ADMIN: system health ──────────────────────────────────────────────────────
analyticsRouter.get('/health', requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    let dbStatus = 'ok'
    try { await prisma.$queryRaw`SELECT 1` } catch { dbStatus = 'error' }
    const mem = process.memoryUsage()
    res.json({
      success: true,
      data: {
        database:    dbStatus,
        uptime:      Math.round(process.uptime()),
        memoryUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
        memoryTotalMB: Math.round(mem.heapTotal / 1024 / 1024),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
      },
    })
  } catch (err) { next(err) }
})

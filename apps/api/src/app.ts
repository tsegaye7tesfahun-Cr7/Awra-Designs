import 'dotenv/config'
import express from 'express'
import path from 'path'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'

import { authRouter } from './routes/auth'
import { projectsRouter } from './routes/projects'
import { aboutRouter } from './routes/about'
import { testimonialsRouter } from './routes/testimonials'
import { blogRouter } from './routes/blog'
import { contactRouter } from './routes/contact'
import { adminRouter } from './routes/admin'
import { uploadRouter } from './routes/upload'
import { faqRouter } from './routes/faq'
import { settingsRouter } from './routes/settings'
import { projectGroupsRouter } from './routes/projectGroups'
import { adminsRouter } from './routes/admins'
import { analyticsRouter } from './routes/analytics'
import { reseedRouter } from './routes/reseed'
import { webhookRouter } from './routes/webhooks'
import { sitemapRouter } from './routes/sitemap'
import { errorHandler } from './middleware/errorHandler'
import { notFound } from './middleware/notFound'
import { setCSRFToken, validateCSRFToken } from './middleware/csrf'
import { startScheduler } from './lib/scheduler'
import prisma from './lib/prisma'

const app = express()

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://localhost:4174',
].filter(Boolean) as string[]

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
      cb(new Error(`CORS: origin ${origin} not allowed`))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// ── Parsers ───────────────────────────────────────────────────────────────────
app.use(compression())
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true, limit: '2mb' }))
app.use(cookieParser())

// ── Logging ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
}

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Awra Designs API is running' })
})

// ── Neon keep-alive ping every 4 minutes ─────────────────────────────────────
const PING_INTERVAL = 4 * 60 * 1000
setInterval(async () => {
  try { await prisma.$queryRaw`SELECT 1` } catch { /* silent */ }
}, PING_INTERVAL)

// ── Auto-publish scheduler ────────────────────────────────────────────────────
startScheduler()

// ── Local dev: serve images from Frontend/public/images ──────────────────────
// In production, images are served from Cloudinary
if (process.env.NODE_ENV !== 'production') {
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))
  const frontendImages = path.join(process.cwd(), '..', 'Frontend', 'public', 'images')
  app.use('/images', express.static(frontendImages))
}

// ── Routes ────────────────────────────────────────────────────────────────────
// CSRF protection for state-changing routes
app.use('/api/auth', authRouter)
app.use('/api/admin', setCSRFToken, adminRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/about', aboutRouter)
app.use('/api/testimonials', testimonialsRouter)
app.use('/api/blog', blogRouter)
app.use('/api/contact', contactRouter)
app.use('/api/upload', uploadRouter)
app.use('/api/faq', faqRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/project-groups', projectGroupsRouter)
app.use('/api/admins', adminsRouter)
app.use('/api/collect',    analyticsRouter)   // public tracker (avoids ad-blocker blocks)
app.use('/api/analytics',  analyticsRouter)   // admin dashboard endpoints
app.use('/api/reseed', reseedRouter)
app.use('/api/webhooks', webhookRouter)
app.use('/sitemap.xml', sitemapRouter)

// ── Error handling ────────────────────────────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

export default app

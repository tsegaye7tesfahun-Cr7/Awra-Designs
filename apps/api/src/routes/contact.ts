import { Router, Request, Response, NextFunction } from 'express'
import { body } from 'express-validator'
import prisma from '../lib/prisma'
import { requireAuth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { contactLimiter, generalLimiter } from '../middleware/rateLimiter'

export const contactRouter = Router()

// POST /api/contact  — public form submission
contactRouter.post(
  '/',
  contactLimiter,
  [
    body('name').trim().notEmpty().isLength({ min: 2, max: 100 }).withMessage('Name is required (2–100 chars)'),
    body('email').trim().isEmail().normalizeEmail().withMessage('Valid email required'),
    body('phone').optional().trim().isLength({ max: 30 }),
    body('subject').optional().trim().isLength({ max: 200 }),
    body('message').trim().notEmpty().isLength({ min: 10, max: 5000 }).withMessage('Message required (10–5000 chars)'),
  ],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, phone, subject, message } = req.body
      await prisma.contactMessage.create({
        data: { name, email, phone, subject, message },
      })
      res.status(201).json({
        success: true,
        message: "Message received — we'll be in touch soon.",
      })
    } catch (err) { next(err) }
  }
)

// ── ADMIN ──────────────────────────────────────────────────────────────────────

// GET /api/contact  — admin, all messages
contactRouter.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const archived = req.query.archived === 'true'
    const unread = req.query.unread === 'true'
    const where: any = { isArchived: archived }
    if (unread) where.isRead = false

    const messages = await prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    res.json({ success: true, data: messages })
  } catch (err) { next(err) }
})

// PATCH /api/contact/:id  — mark read/unread/archived
contactRouter.patch('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allowed = ['isRead', 'isArchived']
    const data: any = {}
    for (const key of allowed) {
      if (key in req.body) data[key] = req.body[key]
    }
    const msg = await prisma.contactMessage.update({ where: { id: req.params.id }, data })
    res.json({ success: true, data: msg })
  } catch (err: any) {
    if (err.code === 'P2025') { res.status(404).json({ success: false, message: 'Message not found' }); return }
    next(err)
  }
})

// DELETE /api/contact/:id  — admin delete
contactRouter.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.contactMessage.delete({ where: { id: req.params.id } })
    res.json({ success: true, message: 'Message deleted' })
  } catch (err: any) {
    if (err.code === 'P2025') { res.status(404).json({ success: false, message: 'Message not found' }); return }
    next(err)
  }
})

// POST /api/contact/:id/reply  — admin, send reply email via Resend
contactRouter.post(
  '/:id/reply',
  requireAuth,
  generalLimiter,
  [
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('body').trim().notEmpty().withMessage('Reply body is required'),
  ],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const msg = await prisma.contactMessage.findUnique({ where: { id: req.params.id } })
      if (!msg) { res.status(404).json({ success: false, message: 'Message not found' }); return }

      const resendKey = process.env.RESEND_API_KEY
      const fromEmail = process.env.REPLY_FROM_EMAIL || 'Awra Designs <noreply@awradesigns.com>'

      if (!resendKey) {
        // Fallback: return a mailto link the admin can use
        const mailtoUrl = `mailto:${msg.email}?subject=${encodeURIComponent(req.body.subject)}&body=${encodeURIComponent(req.body.body)}`
        res.json({ success: false, message: 'RESEND_API_KEY not configured', mailto: mailtoUrl })
        return
      }

      // Send via Resend REST API (no SDK needed — uses native fetch)
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to:   [msg.email],
          subject: req.body.subject,
          text: req.body.body,
          html: `<div style="font-family:sans-serif;max-width:600px;color:#333">${
            req.body.body.replace(/\n/g, '<br/>')
          }<br/><br/><hr style="border:none;border-top:1px solid #eee"/><p style="color:#999;font-size:12px">Awra Designs · Addis Ababa, Ethiopia</p></div>`,
          reply_to: fromEmail,
        }),
      })

      const data = await response.json() as any
      if (!response.ok) {
        res.status(502).json({ success: false, message: data.message || 'Email send failed' })
        return
      }

      // Mark message as read after replying
      await prisma.contactMessage.update({ where: { id: msg.id }, data: { isRead: true } })

      res.json({ success: true, message: 'Reply sent', emailId: data.id })
    } catch (err) { next(err) }
  }
)

import { Router, Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import prisma from '../lib/prisma'
import { log } from '../lib/activityLog'

const router = Router()

// POST /api/newsletter/subscribe - Subscribe to newsletter
router.post('/subscribe', [
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
], async (req: Request, res: Response) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() })
  }

  try {
    const { email } = req.body

    // Check if email already exists
    const existing = await prisma.newsletter.findUnique({
      where: { email }
    })

    if (existing) {
      if (existing.status === 'unsubscribed') {
        // Reactivate unsubscribed user
        await prisma.newsletter.update({
          where: { email },
          data: { status: 'active', updatedAt: new Date() }
        })
        return res.json({ success: true, message: 'Newsletter subscription reactivated' })
      }
      return res.status(409).json({ success: false, message: 'Email already subscribed' })
    }

    // Create new subscription
    await prisma.newsletter.create({
      data: { email }
    })

    // Log activity
    log({
      adminId: undefined,
      adminEmail: 'public',
      action: 'newsletter_subscribed',
      entity: 'newsletter',
      entityId: email,
      entityName: email,
      meta: { email }
    })

    res.json({ success: true, message: 'Successfully subscribed to newsletter' })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    res.status(500).json({ success: false, message: 'Failed to subscribe' })
  }
})

// POST /api/newsletter/unsubscribe - Unsubscribe from newsletter
router.post('/unsubscribe', [
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
], async (req: Request, res: Response) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() })
  }

  try {
    const { email } = req.body

    const existing = await prisma.newsletter.findUnique({
      where: { email }
    })

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Email not found' })
    }

    await prisma.newsletter.update({
      where: { email },
      data: { status: 'unsubscribed', updatedAt: new Date() }
    })

    // Log activity
    log({
      adminId: undefined,
      adminEmail: 'public',
      action: 'newsletter_unsubscribed',
      entity: 'newsletter',
      entityId: email,
      entityName: email,
      meta: { email }
    })

    res.json({ success: true, message: 'Successfully unsubscribed from newsletter' })
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error)
    res.status(500).json({ success: false, message: 'Failed to unsubscribe' })
  }
})

export { router as newsletterRouter }

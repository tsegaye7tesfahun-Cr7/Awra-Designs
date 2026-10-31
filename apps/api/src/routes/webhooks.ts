import { Router, Request, Response } from 'express'
import { body } from 'express-validator'
import prisma from '../lib/prisma'
import { requireAuth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { log } from '../lib/activityLog'

export const webhookRouter = Router()

// Store webhooks
const activeWebhooks = new Map<string, { url: string; secret: string; events: string[] }>()

// Middleware to verify webhook signature
const verifyWebhookSignature = (req: Request, res: Response, next: any) => {
  const signature = req.headers['x-webhook-signature'] as string
  const body = JSON.stringify(req.body)
  
  // In production, use HMAC-SHA256 with the secret
  // For now, just check if the header exists
  if (!signature) {
    return res.status(401).json({ success: false, error: 'Missing signature' })
  }
  
  next()
}

// Trigger webhook
export async function triggerWebhook(event: string, data: any) {
  const webhookEntries = Array.from(activeWebhooks.entries())
  
  for (const [id, webhook] of webhookEntries) {
    if (!webhook.events.includes(event)) continue
    
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': event,
          'X-Webhook-Signature': webhook.secret, // In production, use HMAC
        },
        body: JSON.stringify({
          event,
          timestamp: new Date().toISOString(),
          data,
        }),
      })
      
      if (!response.ok) {
        console.error(`Webhook ${id} failed: ${response.statusText}`)
      }
    } catch (error) {
      console.error(`Webhook ${id} error:`, error)
    }
  }
}

// ADMIN: Register webhook
webhookRouter.post('/register', requireAuth, [
  body('url').isURL().withMessage('Valid URL required'),
  body('secret').notEmpty().withMessage('Secret required'),
  body('events').isArray().withMessage('Events array required'),
], validate, async (req: Request, res: Response) => {
  try {
    const { url, secret, events } = req.body
    const id = `webhook_${Date.now()}`
    
    activeWebhooks.set(id, { url, secret, events })
    
    await log(req.user!.id, 'webhook_registered', { webhookId: id, url, events })
    
    res.json({ success: true, data: { id, url, events } })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to register webhook' })
  }
})

// ADMIN: List webhooks
webhookRouter.get('/list', requireAuth, async (req: Request, res: Response) => {
  try {
    const webhooks = Array.from(activeWebhooks.entries()).map(([id, webhook]) => ({
      id,
      url: webhook.url,
      events: webhook.events,
    }))
    
    res.json({ success: true, data: webhooks })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to list webhooks' })
  }
})

// ADMIN: Delete webhook
webhookRouter.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    if (!activeWebhooks.has(id)) {
      return res.status(404).json({ success: false, error: 'Webhook not found' })
    }
    
    activeWebhooks.delete(id)
    
    await log(req.user!.id, 'webhook_deleted', { webhookId: id })
    
    res.json({ success: true, message: 'Webhook deleted' })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete webhook' })
  }
})

// Test webhook endpoint
webhookRouter.post('/test', requireAuth, [
  body('id').notEmpty().withMessage('Webhook ID required'),
], validate, async (req: Request, res: Response) => {
  try {
    const { id } = req.body
    
    const webhook = activeWebhooks.get(id)
    if (!webhook) {
      return res.status(404).json({ success: false, error: 'Webhook not found' })
    }
    
    await triggerWebhook('test', { message: 'Webhook test successful' })
    
    res.json({ success: true, message: 'Webhook test triggered' })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to test webhook' })
  }
})

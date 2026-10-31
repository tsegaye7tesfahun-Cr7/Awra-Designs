import { Router, Request, Response, NextFunction } from 'express'
import prisma from '../lib/prisma'
import { requireAuth } from '../middleware/auth'
import { generalLimiter } from '../middleware/rateLimiter'
import { log } from '../lib/activityLog'

export const settingsRouter = Router()
settingsRouter.use(generalLimiter)

// Default site settings
const DEFAULTS: Record<string, string> = {
  site_name: 'Awra Designs',
  site_tagline: 'Architecture · Interior · Finishing',
  contact_phone: '+251 92 381 4125',
  contact_email: 'info@awradesigns.com',
  contact_location: 'Addis Ababa, Ethiopia',
  whatsapp_number: '251923814125',
  instagram_url: 'https://www.instagram.com/awradesigns/',
  facebook_url: 'https://web.facebook.com/people/Awra-Designs/100089517497042/',
  telegram_url: 'https://t.me/AwraDesigns',
  tiktok_url: 'https://www.tiktok.com/@awrainteriors',
  google_maps_url: 'https://maps.google.com/maps?q=9.021902,38.786683',
  proof_text: '100+ spaces completed across Ethiopia',
  est_year:           '2019',
  copyright_name:     'Awra Finishing & Interior',
  disciplines:        'Architecture · Interior · Finishing',
  hero_label:         "Addis Ababa's Architecture & Interior Studio",
  logo_url:           '',
  og_image_url:       '',
  notification_email: '',
  reply_from_email:   'Awra Designs <noreply@awradesigns.com>',
  resend_api_key:     '',
}

// GET /api/settings — public, returns all settings as key-value object
settingsRouter.get('/', async (_req, res: Response, next: NextFunction) => {
  try {
    const rows = await prisma.setting.findMany()
    const result: Record<string, string> = { ...DEFAULTS }
    for (const row of rows) result[row.key] = row.value
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
})

// PUT /api/settings — admin, upsert multiple keys at once
settingsRouter.put('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updates = req.body as Record<string, string>
    await Promise.all(
      Object.entries(updates).map(([key, value]) =>
        prisma.setting.upsert({
          where: { key },
          create: { key, value },
          update: { value },
        })
      )
    )
    const rows = await prisma.setting.findMany()
    const result: Record<string, string> = { ...DEFAULTS }
    for (const row of rows) result[row.key] = row.value
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
})

// PATCH /api/settings/password — change admin password
settingsRouter.patch('/password', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bcrypt = await import('bcryptjs')
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      res.status(422).json({ success: false, message: 'currentPassword and newPassword are required' })
      return
    }
    if (newPassword.length < 8) {
      res.status(422).json({ success: false, message: 'New password must be at least 8 characters' })
      return
    }
    const adminReq = req as any
    const admin = await prisma.admin.findUnique({ where: { id: adminReq.adminId } })
    if (!admin) { res.status(404).json({ success: false, message: 'Admin not found' }); return }
    const valid = await bcrypt.compare(currentPassword, admin.password)
    if (!valid) { res.status(401).json({ success: false, message: 'Current password is incorrect' }); return }
    const hashed = await bcrypt.hash(newPassword, 12)
    await prisma.admin.update({ where: { id: admin.id }, data: { password: hashed } })
    const r = req as any
    log({ adminId: admin.id, adminEmail: admin.email, action: 'password_changed', entity: 'setting' })
    res.json({ success: true, message: 'Password updated successfully' })
  } catch (err) { next(err) }
})

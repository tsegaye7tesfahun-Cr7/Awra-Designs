import { Router, Request, Response } from 'express'
import { execSync } from 'child_process'

export const reseedRouter = Router()

/**
 * POST /api/reseed
 * Body: { secret: "RESEED_SECRET env var value" }
 * Runs reset + seed in production to fix image URLs.
 * Protected by a secret key — remove this route after seeding.
 */
reseedRouter.post('/', async (req: Request, res: Response) => {
  const { secret } = req.body
  const expected = process.env.RESEED_SECRET

  if (!expected || secret !== expected) {
    res.status(401).json({ success: false, message: 'Unauthorized' })
    return
  }

  try {
    res.json({ success: true, message: 'Reseed started — check Render logs for progress. This runs in background.' })

    // Run async so response is sent first
    setTimeout(async () => {
      try {
        console.log('[reseed] Starting reset...')
        execSync('npx ts-node src/reset.ts', { stdio: 'inherit' })
        console.log('[reseed] Reset complete. Starting seed...')
        execSync('npx ts-node src/seed.ts', { stdio: 'inherit' })
        console.log('[reseed] ✅ Reseed complete!')
      } catch (err) {
        console.error('[reseed] ❌ Failed:', err)
      }
    }, 100)
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to start reseed' })
  }
})

import prisma from './prisma'

/**
 * Auto-publish scheduler — runs every 60 seconds.
 * Finds projects and blog posts whose scheduledAt has passed
 * and publishes them automatically.
 */
export function startScheduler(): void {
  const tick = async () => {
    const now = new Date()
    try {
      // Publish scheduled projects
      const projects = await (prisma as any).project.updateMany({
        where: {
          isPublished: false,
          scheduledAt: { lte: now },
        },
        data: {
          isPublished: true,
          scheduledAt: null,
        },
      })

      // Publish scheduled blog posts
      const posts = await (prisma as any).blogPost.updateMany({
        where: {
          isPublished: false,
          scheduledAt: { lte: now },
        },
        data: {
          isPublished: true,
          scheduledAt: null,
          publishedAt: now,
        },
      })

      if (projects.count > 0) {
        console.log(`[scheduler] Published ${projects.count} project(s)`)
      }
      if (posts.count > 0) {
        console.log(`[scheduler] Published ${posts.count} blog post(s)`)
      }
    } catch (err) {
      console.error('[scheduler] Error during auto-publish tick:', err)
    }
  }

  // Run immediately on start, then every 60 seconds
  tick()
  setInterval(tick, 60_000)
  console.log('[scheduler] Auto-publish scheduler started')
}

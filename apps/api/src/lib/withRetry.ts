import prisma from './prisma'

const NEON_ERRORS = [
  'Can\'t reach database server',
  'Connection refused',
  'connection timeout',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'P1001', // Prisma: can't reach DB
  'P1002', // Prisma: DB server timeout
]

function isNeonSleepError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  return NEON_ERRORS.some(e => msg.includes(e))
}

/**
 * Wraps a Prisma operation with automatic retry on Neon cold-start errors.
 * On first failure it reconnects and retries once.
 */
export async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    if (isNeonSleepError(err)) {
      console.warn('[db] Neon cold start detected — reconnecting and retrying…')
      try {
        await prisma.$disconnect()
        await prisma.$connect()
        return await fn()
      } catch (retryErr) {
        throw retryErr
      }
    }
    throw err
  }
}

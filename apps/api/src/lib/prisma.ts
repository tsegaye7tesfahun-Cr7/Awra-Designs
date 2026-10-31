import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

function createPrismaClient() {
  return new PrismaClient({
    log: ['error'],
    datasources: {
      db: {
        // Add connection timeout params so Neon wakes up properly
        url: process.env.DATABASE_URL,
      },
    },
  })
}

// Reuse the same client in dev (hot reload safety)
const prisma = global.__prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma
}

export default prisma

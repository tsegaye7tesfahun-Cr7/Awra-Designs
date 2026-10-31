import { Request, Response, NextFunction } from 'express'
import prisma from '../lib/prisma'

export interface AppError extends Error {
  statusCode?: number
}

const NEON_MSGS = [
  "Can't reach database server",
  'Connection refused',
  'connection timeout',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'P1001',
  'P1002',
]

function isDbConnectionError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  return NEON_MSGS.some(s => msg.includes(s))
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Neon cold-start: reconnect silently and ask client to retry
  if (isDbConnectionError(err)) {
    console.warn('[db] Connection error — scheduling reconnect')
    prisma.$disconnect().then(() => prisma.$connect()).catch(() => {})
    res.status(503).json({
      success: false,
      message: 'Database is waking up. Please retry in a moment.',
    })
    return
  }

  const statusCode = err.statusCode ?? 500
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'An unexpected error occurred'
      : err.message || 'An unexpected error occurred'

  res.status(statusCode).json({ success: false, message })
}

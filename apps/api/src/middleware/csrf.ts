import { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'

const CSRF_TOKEN_COOKIE = 'csrf_token'
const CSRF_TOKEN_HEADER = 'x-csrf-token'

// Generate a random CSRF token
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Middleware to set CSRF token cookie for GET requests
export function setCSRFToken(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'GET') {
    const token = generateCSRFToken()
    res.cookie(CSRF_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000, // 1 hour
    })
  }
  next()
}

// Middleware to validate CSRF token for state-changing requests
export function validateCSRFToken(req: Request, res: Response, next: NextFunction) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next()
  }

  const tokenFromCookie = req.cookies[CSRF_TOKEN_COOKIE]
  const tokenFromHeader = req.headers[CSRF_TOKEN_HEADER] as string

  if (!tokenFromCookie || !tokenFromHeader || tokenFromCookie !== tokenFromHeader) {
    return res.status(403).json({ success: false, error: 'Invalid CSRF token' })
  }

  next()
}

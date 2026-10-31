import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  adminId?:    string
  adminEmail?: string
  adminRole?:  string
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  let token: string | undefined
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7)
  } else if (req.cookies?.token) {
    token = req.cookies.token
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Authentication required' })
    return
  }

  try {
    const secret = process.env.JWT_SECRET
    if (!secret) throw new Error('JWT_SECRET not configured')
    const payload = jwt.verify(token, secret) as { adminId: string; email?: string; role?: string }
    req.adminId    = payload.adminId
    req.adminEmail = payload.email
    req.adminRole  = payload.role
    next()
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}

/**
 * Require a specific role. Must be used AFTER requireAuth.
 * Usage: router.delete('/:id', requireAuth, requireRole('admin'), handler)
 */
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.adminRole || !roles.includes(req.adminRole)) {
      res.status(403).json({ success: false, message: 'Insufficient permissions' })
      return
    }
    next()
  }
}

import { Request, Response, NextFunction } from 'express'
import rateLimit from 'express-rate-limit'

// Store rate limit info per user ID
const userRateLimits = new Map<string, { count: number; resetTime: number }>()

// Per-user rate limiter middleware
export function perUserRateLimit(options: {
  windowMs: number
  max: number
  skipSuccessfulRequests?: boolean
}) {
  const { windowMs, max, skipSuccessfulRequests = false } = options

  return (req: Request, res: Response, next: NextFunction) => {
    // Get user identifier from JWT or IP
    const authHeader = req.headers.authorization
    let userId: string

    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Use token hash as user ID (simplified - in production, decode JWT to get actual user ID)
      userId = `user_${authHeader.slice(7).substring(0, 16)}`
    } else {
      // Fall back to IP
      userId = `ip_${req.ip}`
    }

    const now = Date.now()
    const userLimit = userRateLimits.get(userId)

    if (!userLimit || now > userLimit.resetTime) {
      // Reset or create new limit
      userRateLimits.set(userId, {
        count: 1,
        resetTime: now + windowMs,
      })
      return next()
    }

    if (userLimit.count >= max) {
      const resetIn = Math.ceil((userLimit.resetTime - now) / 1000)
      res.set('Retry-After', resetIn.toString())
      res.set('X-RateLimit-Limit', max.toString())
      res.set('X-RateLimit-Remaining', '0')
      res.set('X-RateLimit-Reset', new Date(userLimit.resetTime).toISOString())
      
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${resetIn} seconds.`,
      })
    }

    // Increment count
    userLimit.count++
    res.set('X-RateLimit-Limit', max.toString())
    res.set('X-RateLimit-Remaining', (max - userLimit.count).toString())
    res.set('X-RateLimit-Reset', new Date(userLimit.resetTime).toISOString())

    next()
  }
}

// Clean up expired entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now()
  for (const [userId, limit] of userRateLimits.entries()) {
    if (now > limit.resetTime) {
      userRateLimits.delete(userId)
    }
  }
}, 5 * 60 * 1000)

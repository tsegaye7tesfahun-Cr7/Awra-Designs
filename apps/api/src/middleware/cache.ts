import { Request, Response, NextFunction } from 'express'

// Simple in-memory cache (in production, use Redis)
const cache = new Map<string, { data: any; expiry: number }>()

interface CacheOptions {
  ttl?: number // Time to live in milliseconds (default: 5 minutes)
  keyGenerator?: (req: Request) => string
}

export function cacheResponse(options: CacheOptions = {}) {
  const { ttl = 5 * 60 * 1000, keyGenerator } = options

  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next()
    }

    const cacheKey = keyGenerator ? keyGenerator(req) : `${req.originalUrl}`
    const now = Date.now()
    const cached = cache.get(cacheKey)

    // Return cached response if valid
    if (cached && cached.expiry > now) {
      res.set('X-Cache', 'HIT')
      res.set('X-Cache-Age', Math.floor((now - (cached.expiry - ttl)) / 1000).toString())
      return res.json(cached.data)
    }

    // Store original json method
    const originalJson = res.json.bind(res)

    // Override json to cache response
    res.json = function (data: any) {
      // Cache successful responses
      if (res.statusCode === 200) {
        cache.set(cacheKey, {
          data,
          expiry: now + ttl,
        })
        res.set('X-Cache', 'MISS')
      }

      return originalJson(data)
    }

    next()
  }
}

// Clear cache for a specific key
export function clearCache(key: string) {
  cache.delete(key)
}

// Clear all cache
export function clearAllCache() {
  cache.clear()
}

// Clean up expired entries periodically (every minute)
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of cache.entries()) {
    if (value.expiry < now) {
      cache.delete(key)
    }
  }
}, 60 * 1000)

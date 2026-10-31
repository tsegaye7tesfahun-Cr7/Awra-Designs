import { Request, Response } from 'express'
import prisma from '../lib/prisma'

export async function healthCheck(req: Request, res: Response) {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'connected',
      },
    }

    res.status(200).json(health)
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
    })
  }
}

export async function readinessCheck(req: Request, res: Response) {
  try {
    // Check critical services
    await prisma.$queryRaw`SELECT 1`

    const ready = {
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'passed',
      },
    }

    res.status(200).json(ready)
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'failed',
      },
    })
  }
}

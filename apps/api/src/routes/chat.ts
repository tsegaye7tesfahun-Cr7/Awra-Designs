import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// POST /api/chat/messages - Store chat message
router.post('/messages', async (req, res) => {
  try {
    const { text, sender } = req.body

    if (!text || !sender) {
      return res.status(400).json({ error: 'Text and sender are required' })
    }

    // Store message in database
    const message = await prisma.chatMessage.create({
      data: {
        text,
        sender,
        sessionId: 'anonymous',
      }
    })

    res.json({ success: true, message })
  } catch (error) {
    console.error('Error storing chat message:', error)
    res.status(500).json({ error: 'Failed to store message' })
  }
})

// GET /api/chat/messages - Get chat history (admin only)
router.get('/messages', async (req, res) => {
  try {
    // This would need authentication middleware in production
    const messages = await prisma.chatMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    res.json(messages)
  } catch (error) {
    console.error('Error fetching chat messages:', error)
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
})

export default router

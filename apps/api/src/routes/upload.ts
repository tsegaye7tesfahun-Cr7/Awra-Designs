import { Router, Request, Response, NextFunction } from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { requireAuth } from '../middleware/auth'

export const uploadRouter = Router()

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
})

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

// Store files in memory, upload to Cloudinary
const storage = multer.memoryStorage()

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed (jpg, jpeg, png, webp, gif, svg)'))
  }
}

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE } })

// Helper: upload buffer to Cloudinary
async function uploadToCloudinary(buffer: Buffer, folder: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `awra-designs/${folder}`, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error)
        if (!result) return reject(new Error('No result from Cloudinary'))
        resolve(result.secure_url)
      }
    )
    stream.end(buffer)
  })
}

// POST /api/upload/single — upload one image
uploadRouter.post(
  '/single',
  requireAuth,
  upload.single('image'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No file uploaded' })
        return
      }
      const url = await uploadToCloudinary(req.file.buffer, 'general')
      res.json({ success: true, data: { url } })
    } catch (err: any) {
      next(err)
    }
  }
)

// POST /api/upload/multiple — upload up to 10 images
uploadRouter.post(
  '/multiple',
  requireAuth,
  upload.array('images', 10),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as Express.Multer.File[]
      if (!files || files.length === 0) {
        res.status(400).json({ success: false, message: 'No files uploaded' })
        return
      }
      const urls = await Promise.all(files.map(f => uploadToCloudinary(f.buffer, 'general')))
      res.json({ success: true, data: { urls } })
    } catch (err: any) {
      next(err)
    }
  }
)

// GET /api/upload/media — list recent uploads from Cloudinary
uploadRouter.get(
  '/media',
  requireAuth,
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await cloudinary.search
        .expression('folder:awra-designs/*')
        .sort_by('created_at', 'desc')
        .max_results(100)
        .with_field('context')
        .execute()
      const resources = result.resources.map((r: any) => ({
        publicId:  r.public_id,
        url:       r.secure_url,
        width:     r.width,
        height:    r.height,
        bytes:     r.bytes,
        createdAt: r.created_at,
        format:    r.format,
      }))
      res.json({ success: true, data: resources })
    } catch (err: any) {
      next(err)
    }
  }
)

// DELETE /api/upload/media — delete an image from Cloudinary by publicId
uploadRouter.delete(
  '/media',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { publicId } = req.body
      if (!publicId) {
        res.status(400).json({ success: false, message: 'publicId is required' })
        return
      }
      await cloudinary.uploader.destroy(publicId)
      res.json({ success: true, message: 'Image deleted' })
    } catch (err: any) {
      next(err)
    }
  }
)

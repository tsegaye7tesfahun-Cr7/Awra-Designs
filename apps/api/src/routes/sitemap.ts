import { Router, Request, Response } from 'express'
import prisma from '../lib/prisma'

export const sitemapRouter = Router()

sitemapRouter.get('/sitemap.xml', async (req: Request, res: Response) => {
  try {
    const baseUrl = 'https://awradesigns.com'
    const currentDate = new Date().toISOString()

    // Fetch all published projects
    const projects = await prisma.project.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    })

    // Fetch all published blog posts
    const blogPosts = await prisma.blogPost.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    })

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static pages -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/#works</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/#about</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/#testimonials</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/#contact</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`

    // Add projects
    projects.forEach(project => {
      const lastmod = new Date(project.updatedAt).toISOString()
      xml += `  <url>
    <loc>${baseUrl}/project/${project.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`
    })

    // Add blog posts
    blogPosts.forEach(post => {
      const lastmod = new Date(post.updatedAt).toISOString()
      xml += `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`
    })

    xml += `</urlset>`

    res.set('Content-Type', 'application/xml')
    res.send(xml)
  } catch (error) {
    console.error('Sitemap generation error:', error)
    res.status(500).json({ success: false, error: 'Failed to generate sitemap' })
  }
})

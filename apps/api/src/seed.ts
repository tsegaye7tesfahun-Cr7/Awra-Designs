import 'dotenv/config'
import bcrypt from 'bcryptjs'
import prisma from './lib/prisma'
import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
import path from 'path'

// ── Cloudinary setup ──────────────────────────────────────────────────────────
const hasCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name'
)

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure:     true,
  })
  console.log('✓ Cloudinary configured — images will be uploaded to Cloudinary')
} else {
  console.log('  Cloudinary not configured — using local image URLs (dev mode)')
}

const FRONTEND_PUBLIC = path.join(process.cwd(), '..', 'Frontend', 'public')
const LOCAL_BASE = process.env.BACKEND_URL || process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`

// Upload a local image to Cloudinary, or return a local URL in dev
const uploadedCache: Record<string, string> = {}
async function getUrl(publicPath: string): Promise<string> {
  if (uploadedCache[publicPath]) return uploadedCache[publicPath]

  if (!hasCloudinary) {
    const url = `${LOCAL_BASE}${publicPath}`
    uploadedCache[publicPath] = url
    return url
  }

  const localFile = path.join(FRONTEND_PUBLIC, publicPath)
  if (!fs.existsSync(localFile)) {
    console.warn(`  File not found locally: ${localFile}`)
    const url = `${LOCAL_BASE}${publicPath}`
    uploadedCache[publicPath] = url
    return url
  }

  try {
    const result = await cloudinary.uploader.upload(localFile, {
      folder: 'awra-designs',
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    })
    uploadedCache[publicPath] = result.secure_url
    console.log(`  ↑ Uploaded: ${publicPath}`)
    return result.secure_url
  } catch (err: any) {
    console.warn(`  Upload failed for ${publicPath}: ${err.message}`)
    const url = `${LOCAL_BASE}${publicPath}`
    uploadedCache[publicPath] = url
    return url
  }
}

async function projUrls(group: string, sub: string, prefix: string, nums: number[]) {
  return Promise.all(nums.map(n => getUrl(`/images/Projects/${group}/${sub}/${prefix} ${n}.jpg`)))
}

async function main() {
  const email    = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password) { console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env'); process.exit(1) }

  // ── Admin user ────────────────────────────────────────────────────────────
  const adminExists = await prisma.admin.findFirst({ where: { email } })
  if (!adminExists) {
    const hash = await bcrypt.hash(password, 12)
    await prisma.admin.create({ data: { email, password: hash, name: 'Admin' } })
    console.log('✓ Admin user created')
  } else {
    console.log('  Admin user already exists — skipping')
  }

  // ── About & Team ──────────────────────────────────────────────────────────
  const aboutExists = await prisma.about.findFirst()
  if (!aboutExists) {
    console.log('Uploading team images...')
    const [t1, t2, t3, t4] = await Promise.all([
      getUrl('/images/The Team/Tesfahun Tsegaye.webp'),
      getUrl('/images/The Team/Sarah Bekele.webp'),
      getUrl('/images/The Team/Daniel Haile.webp'),
      getUrl('/images/The Team/Bereket Fikre.webp'),
    ])
    await prisma.about.create({
      data: {
        headline1: 'We design spaces',
        headline2: 'that outlast trends.',
        tagline: 'At Awra Designs, we create architecture that balances elegance, functionality, and lasting value.',
        mission: 'To deliver exceptional architectural and interior design solutions that transform spaces.',
        vision: 'To be the leading architecture and interior design studio in East Africa.',
        isActive: true,
        teamMembers: {
          create: [
            { name: 'Tesfahun Tsegaye', nameAm: 'ተስፋሁን ፀጋዬ', role: 'Founder & Lead Architect', roleAm: 'መስራች እና ዋና አርክቴክት', imageUrl: t1, order: 0 },
            { name: 'Sarah Bekele',     nameAm: 'ሣራ በቀለ',     role: 'Lead Interior Designer',  roleAm: 'ዋና ኢንቴሪየር ዲዛይነር',   imageUrl: t2, order: 1 },
            { name: 'Daniel Haile',     nameAm: 'ዳንኤል ሃይሌ',   role: 'Senior Architect',         roleAm: 'ሲኒየር አርክቴክት',         imageUrl: t3, order: 2 },
            { name: 'Bereket Fikre',    nameAm: 'በረከት ፍቅሬ',   role: 'Brand Designer',           roleAm: 'ብራንድ ዲዛይነር',          imageUrl: t4, order: 3 },
          ],
        },
      },
    })
    console.log('✓ About & team seeded')
  } else {
    console.log('  About already exists — skipping')
  }

  // ── Projects ──────────────────────────────────────────────────────────────
  const projCount = await prisma.project.count()
  if (projCount === 0) {
    console.log('Uploading project images...')
    const [
      archLayouts, archReno, archFacades,
      resLounge, resBed, resKids, resBath, resTerrace, resIslamic,
      comOffice, comSalon,
      outFence,
    ] = await Promise.all([
      projUrls('Architecture', 'Architectural Layouts & Spatial Programming', 'Architectural Layouts', [1,2,3,4]),
      projUrls('Architecture', 'Renovations & Transformations', 'Renovations', [1,2,3,4]),
      projUrls('Architecture', 'For Facades & Outer 3D', 'For Facades & Outer 3D -', [1,2,3,4]),
      projUrls('Residential Interiors', 'Lounges & Family Rooms', 'Lounges & Family Rooms', [1,2,3,4]),
      projUrls('Residential Interiors', 'Master Bedrooms & Suites', 'Master Bedrooms', [1,2,3,4]),
      projUrls('Residential Interiors', "Creative Kids' Bedrooms & Nurseries", 'Kids Bedrooms', [1,2,3,4]),
      projUrls('Residential Interiors', 'Luxury Bathrooms & Powder Rooms', 'Luxury Bathrooms', [1,2,3,4]),
      projUrls('Residential Interiors', 'Terraces & Verandas', 'Terraces Verandas', [1,2,3,4]),
      projUrls('Residential Interiors', 'Islamic Luxury Interiors', 'Islamic Luxury Interiors', [1,2,3,4]),
      projUrls('Commercial Design', 'Corporate Offices & Workspaces', 'Corporate Offices', [1,2,3,4]),
      projUrls('Commercial Design', 'Beauty Salons, Wellness & Retail', 'Beauty Salons', [1,2,3,4]),
      projUrls('Outdoor Design', 'Fences, Gates & Compound Seating', 'Fences, Gates & Compound Seating', [1,2,3,4]),
    ])

    const projects = [
      {
        title: 'Architectural Layout Design',
        slug: 'architectural-layout-design',
        category: 'Architectural Layouts & Spatial Programming',
        filter: 'architecture',
        shortDescription: 'Spatial programming and functional zoning.',
        description: 'A comprehensive architectural layout study combining spatial programming, circulation analysis, and functional zoning to create environments that work as beautifully as they look.',
        coverImage: archLayouts[0],
        galleryImages: archLayouts,
        year: '2024', type: 'Residential',
        services: ['Architectural Layout', 'Spatial Programming', 'Circulation Analysis'],
        isFeatured: false, isPublished: true, order: 0,
      },
      {
        title: 'Complete Home Renovation',
        slug: 'complete-home-renovation',
        category: 'Renovations & Transformations',
        filter: 'architecture',
        shortDescription: 'Full structural and aesthetic renovation.',
        description: 'A comprehensive renovation that completely reimagined an existing home — stripping it back to structure and rebuilding with modern materials, better light, and purposeful spaces.',
        coverImage: archReno[0],
        galleryImages: archReno,
        year: '2024', type: 'Residential',
        services: ['Renovation', 'Interior Design', 'Project Management'],
        isFeatured: false, isPublished: true, order: 1,
      },
      {
        title: 'Modern Residential Facade',
        slug: 'modern-residential-facade',
        category: 'Facades & Exterior 3D Designs',
        filter: 'architecture',
        shortDescription: 'High-fidelity 3D exterior rendering.',
        description: 'A high-fidelity 3D rendering of a modern residential facade — exploring material contrast, fenestration rhythm, and the relationship between built form and landscape.',
        coverImage: archFacades[0],
        galleryImages: archFacades,
        year: '2024', type: 'Residential',
        services: ['3D Rendering', 'Facade Design', 'Exterior Architecture'],
        isFeatured: true, isPublished: true, order: 2,
      },
      {
        title: 'Luxury Family Lounge',
        slug: 'luxury-family-lounge',
        category: 'Lounges & Family Rooms',
        filter: 'residential',
        shortDescription: 'Grand yet comfortable family living space.',
        description: 'A spacious family lounge that feels both grand and deeply comfortable — layered textures, integrated lighting, and custom furniture create a space the whole family wants to live in.',
        coverImage: resLounge[0],
        galleryImages: resLounge,
        year: '2024', type: 'Residential',
        services: ['Interior Design', 'Custom Furniture', 'Lighting Design'],
        isFeatured: false, isPublished: true, order: 3,
      },
      {
        title: 'Master Bedroom Suite',
        slug: 'master-bedroom-suite',
        category: 'Master Bedrooms & Suites',
        filter: 'residential',
        shortDescription: 'A sanctuary of premium finishes and calm.',
        description: 'A master bedroom designed as a true sanctuary — custom millwork, premium finishes, integrated dressing and en-suite, all unified by a calming palette that promotes deep rest.',
        coverImage: resBed[0],
        galleryImages: resBed,
        year: '2024', type: 'Residential',
        services: ['Bedroom Design', 'Custom Millwork', 'Lighting'],
        isFeatured: false, isPublished: true, order: 4,
      },
      {
        title: "Creative Children's Bedroom",
        slug: 'creative-childrens-bedroom',
        category: "Kids' Bedrooms & Nurseries",
        filter: 'residential',
        shortDescription: 'Imaginative, practical, and built to grow.',
        description: "A creative children's bedroom that sparks imagination while remaining practical — built-in storage, adaptable furniture, and a playful palette that doesn't sacrifice quality.",
        coverImage: resKids[0],
        galleryImages: resKids,
        year: '2024', type: 'Residential',
        services: ['Kids Room Design', 'Built-in Storage', 'Furniture'],
        isFeatured: false, isPublished: true, order: 5,
      },
      {
        title: 'Spa-Inspired Bathroom',
        slug: 'spa-inspired-bathroom',
        category: 'Luxury Bathrooms & Powder Rooms',
        filter: 'residential',
        shortDescription: 'Five-star spa calm in a private setting.',
        description: 'A luxury bathroom that channels the calm of a five-star spa — natural stone, warm-toned metals, freestanding bath, and carefully positioned lighting.',
        coverImage: resBath[0],
        galleryImages: resBath,
        year: '2024', type: 'Residential',
        services: ['Bathroom Design', 'Material Specification', 'Lighting'],
        isFeatured: false, isPublished: true, order: 6,
      },
      {
        title: 'Terrace & Veranda Living',
        slug: 'terrace-veranda-living',
        category: 'Terraces & Verandas',
        filter: 'residential',
        shortDescription: 'Year-round outdoor living, inside and out.',
        description: 'Thoughtfully designed terraces and verandas that blur the boundary between inside and out — using shade, greenery, and material continuity to create year-round outdoor living.',
        coverImage: resTerrace[0],
        galleryImages: resTerrace,
        year: '2024', type: 'Residential',
        services: ['Outdoor Design', 'Landscape', 'Material Selection'],
        isFeatured: false, isPublished: true, order: 7,
      },
      {
        title: 'Islamic Luxury Interior',
        slug: 'islamic-luxury-interior',
        category: 'Islamic Luxury Interiors',
        filter: 'residential',
        shortDescription: 'Heritage geometry meets premium materials.',
        description: 'An interior that honours Islamic artistic heritage through geometric patterns, calligraphy-inspired details, and premium materials.',
        coverImage: resIslamic[0],
        galleryImages: resIslamic,
        year: '2024', type: 'Residential',
        services: ['Interior Design', 'Custom Patterns', 'Material Specification'],
        isFeatured: false, isPublished: true, order: 8,
      },
      {
        title: 'Modern Corporate Office',
        slug: 'modern-corporate-office',
        category: 'Corporate Offices & Workspaces',
        filter: 'commercial',
        shortDescription: 'Culture-reflecting collaborative workspace.',
        description: 'A modern corporate office designed to reflect the company culture — open collaboration zones, quiet focus areas, executive suites, and a reception that makes a strong first impression.',
        coverImage: comOffice[0],
        galleryImages: comOffice,
        year: '2024', type: 'Commercial',
        services: ['Office Design', 'Space Planning', 'Furniture Specification'],
        isFeatured: false, isPublished: true, order: 9,
      },
      {
        title: 'Luxury Beauty Salon',
        slug: 'luxury-beauty-salon',
        category: 'Beauty Salons, Wellness & Retail',
        filter: 'commercial',
        shortDescription: 'Premium salon designed to impress clients.',
        description: 'A luxury beauty salon designed to be as beautiful as the services it offers — thoughtful station layout, premium materials, flattering lighting, and a relaxing colour palette.',
        coverImage: comSalon[0],
        galleryImages: comSalon,
        year: '2024', type: 'Commercial',
        services: ['Commercial Interior', 'Lighting Design', 'Layout Planning'],
        isFeatured: false, isPublished: true, order: 10,
      },
      {
        title: 'Compound Gate & Seating Design',
        slug: 'compound-gate-seating-design',
        category: 'Fences, Gates & Compound Seating',
        filter: 'outdoor',
        shortDescription: 'Security, aesthetics, and craftsmanship combined.',
        description: 'A considered design for compound boundaries, entrance gates, and integrated outdoor seating — balancing security, aesthetics, and craftsmanship in every detail.',
        coverImage: outFence[0],
        galleryImages: outFence,
        year: '2024', type: 'Residential',
        services: ['Outdoor Design', 'Gate Design', 'Compound Planning'],
        isFeatured: false, isPublished: true, order: 11,
      },
    ]

    for (const p of projects) {
      await prisma.project.create({ data: p })
    }
    console.log(`✓ ${projects.length} projects seeded`)
  } else {
    console.log(`  ${projCount} projects already exist — skipping`)
  }

  // ── Testimonials ──────────────────────────────────────────────────────────
  const testCount = await prisma.testimonial.count()
  if (testCount === 0) {
    console.log('Uploading testimonial images...')
    const [i1, i2, i3, i4] = await Promise.all([
      getUrl('/images/Testimonials/Alemu Bekele.webp'),
      getUrl('/images/Testimonials/Marta Asfaw.webp'),
      getUrl('/images/Testimonials/Yonas Tadesse.webp'),
      getUrl('/images/Testimonials/Tigist Mekonnen.webp'),
    ])
    await prisma.testimonial.createMany({
      data: [
        { clientName: 'Alemu Bekele',    position: 'Business Owner',    imageUrl: i1, text: 'Awra transformed our office into a modern, inspiring workspace. Their attention to detail and professional approach exceeded every expectation.', isFeatured: true,  isPublished: true, order: 0 },
        { clientName: 'Marta Asfaw',     position: 'Homeowner',          imageUrl: i2, text: 'They understood our vision and brought it to life beautifully. Working with Awra was a delightful experience from start to finish.',              isFeatured: false, isPublished: true, order: 1 },
        { clientName: 'Yonas Tadesse',   position: 'Restaurant Owner',   imageUrl: i3, text: 'The interior design work completely transformed our restaurant. We receive compliments from guests every day. Excellent craftsmanship.',             isFeatured: false, isPublished: true, order: 2 },
        { clientName: 'Tigist Mekonnen', position: 'Residential Client', imageUrl: i4, text: "Professional, reliable, and deeply creative. The finishing work is impeccable and perfectly reflects our family's character.",                     isFeatured: false, isPublished: true, order: 3 },
      ],
    })
    console.log('✓ 4 testimonials seeded')
  } else {
    console.log(`  ${testCount} testimonials already exist — skipping`)
  }

  // ── Blog Posts ────────────────────────────────────────────────────────────
  const blogCount = await prisma.blogPost.count()
  if (blogCount === 0) {
    console.log('Uploading blog images...')
    const [b1, b2, b3] = await Promise.all([
      getUrl('/images/Blog/Blog 1.jpg'),
      getUrl('/images/Blog/Blog 2.jpg'),
      getUrl('/images/Blog/Blog 3.jpg'),
    ])
    await prisma.blogPost.createMany({
      data: [
        {
          title: 'Top Interior Design Trends for 2026',
          slug: 'interior-design-trends-2026',
          excerpt: 'Sustainable materials, biophilic design, and smart integration — the ideas shaping interiors this year.',
          content: `As we move through 2026, interior design is embracing new philosophies that prioritise sustainability, functionality, and personal well-being.\n\nSustainable materials are taking centre stage. Bamboo flooring, reclaimed wood, and recycled metal accents are increasingly common in high-end residential and commercial projects.\n\nBiophilic design remains strong. Integrating living walls, natural light, and organic textures creates spaces that feel grounding and restorative.\n\nColour palettes are shifting towards earthy tones and warm neutrals. Terracotta, sage green, and warm whites are replacing the cool greys that dominated the previous decade.\n\nThe desire for craftsmanship is growing. Clients want bespoke joinery, handmade ceramics, and thoughtfully chosen materials with a story behind them.`,
          coverImage: b1,
          category: 'Interior Design',
          tags: ['trends', 'interior design', '2026', 'sustainability'],
          author: 'Awra Designs',
          readTime: '5 min read',
          isPublished: true,
          publishedAt: new Date('2024-12-15'),
        },
        {
          title: 'Architectural Planning in Ethiopia: A Practical Guide',
          slug: 'architectural-planning-ethiopia',
          excerpt: 'Navigating permits, zoning, and local building codes for your next project in Addis Ababa.',
          content: `Architectural planning in Ethiopia requires careful navigation of local regulations, cultural considerations, and environmental factors.\n\nBefore beginning any project, you will need to obtain permits from the relevant municipal authorities. In Addis Ababa, this process involves the City Administration's Construction and Infrastructure Bureau.\n\nThe approval timeline typically runs four to eight weeks for standard residential projects. Larger commercial developments can take significantly longer.\n\nZoning regulations vary by sub-city and kebele. It is essential to verify land-use permissions early in the design process to avoid costly redesigns later.\n\nLocal building codes require compliance with Ethiopian Standard ES and relevant international standards for structural safety. Engaging a licensed Ethiopian structural engineer is mandatory for projects above a certain scale.`,
          coverImage: b2,
          category: 'Architecture',
          tags: ['ethiopia', 'architecture', 'planning', 'addis ababa'],
          author: 'Awra Designs',
          readTime: '8 min read',
          isPublished: true,
          publishedAt: new Date('2024-12-10'),
        },
        {
          title: 'How Colour Shapes the Spaces We Live In',
          slug: 'colour-psychology-interior-design',
          excerpt: 'The psychology behind colour choices — and how to use them intentionally in your home or office.',
          content: `Colour psychology is one of the quieter tools in interior design. It works subtly — influencing mood, perceived space, and even productivity without most people ever noticing.\n\nBlue in its softer shades promotes calm and focus, making it ideal for bedrooms and study spaces. Stronger blues work well in corporate environments.\n\nYellow brings energy and warmth, though in excess it can feel fatiguing. Small doses in kitchens or entryways are often most effective.\n\nGreen connects spaces to the natural world. It is perhaps the most versatile colour in interior design — equally at home in a bathroom, a living room, or a commercial lobby.\n\nThe most important principle when working with colour is consistency. A considered palette of two or three complementary colours, applied intentionally across walls, textiles, and accents, will always outperform a random collection of individual "nice" colours.`,
          coverImage: b3,
          category: 'Design Tips',
          tags: ['colour', 'psychology', 'interior design', 'tips'],
          author: 'Awra Designs',
          readTime: '6 min read',
          isPublished: true,
          publishedAt: new Date('2024-12-05'),
        },
      ],
    })
    console.log('✓ 3 blog posts seeded')
  } else {
    console.log(`  ${blogCount} blog posts already exist — skipping`)
  }

  // ── FAQ ───────────────────────────────────────────────────────────────────
  const faqCount = await prisma.faqItem.count()
  if (faqCount === 0) {
    await prisma.faqItem.createMany({
      data: [
        { question: 'What services does Awra Designs offer?',             answer: 'We offer architectural design, interior design, 3D visualisation, finishing works, and branding services for residential, commercial, and outdoor projects.',                                     category: 'Services',  order: 0, isPublished: true },
        { question: 'Where are you based?',                               answer: 'We are based in Addis Ababa, Ethiopia, and serve clients across the country.',                                                                                                                        category: 'General',   order: 1, isPublished: true },
        { question: 'How long does a typical project take?',              answer: 'Timelines vary by project size. A residential interior design project typically takes 4–8 weeks for design and 2–4 months for execution. We provide a detailed timeline during the initial consultation.', category: 'Process',   order: 2, isPublished: true },
        { question: 'Do you handle construction and finishing too?',      answer: 'Yes. We manage the full process from concept and design through to construction supervision and finishing works, giving you a single point of responsibility.',                                      category: 'Services',  order: 3, isPublished: true },
        { question: 'How do I start a project with Awra Designs?',       answer: 'Simply reach out via our contact form or WhatsApp. We will schedule an initial consultation to discuss your vision, requirements, and budget before presenting a tailored proposal.',                  category: 'Process',   order: 4, isPublished: true },
        { question: 'What is your pricing structure?',                    answer: 'Pricing depends on project scope, size, and complexity. We offer transparent, itemised proposals so you know exactly what you are paying for. Contact us for a free initial consultation.',            category: 'Pricing',   order: 5, isPublished: true },
        { question: 'Do you work on commercial projects?',                answer: 'Yes. We design offices, retail spaces, salons, restaurants, and other commercial environments. Our commercial work follows the same rigorous design standards as our residential projects.',            category: 'Services',  order: 6, isPublished: true },
        { question: 'Can I see examples of your previous work?',          answer: 'Yes — visit our Portfolio section to browse projects across Architecture, Residential Interiors, Commercial Design, and Outdoor spaces.',                                                              category: 'General',   order: 7, isPublished: true },
      ],
    })
    console.log('✓ 8 FAQ items seeded')
  } else {
    console.log(`  ${faqCount} FAQ items already exist — skipping`)
  }

  // ── Settings ──────────────────────────────────────────────────────────────
  const settingsCount = await prisma.setting.count()
  if (settingsCount === 0) {
    await prisma.setting.createMany({
      data: [
        { key: 'site_name',       value: 'Awra Designs' },
        { key: 'site_tagline',    value: 'Architecture & Interior Design' },
        { key: 'proof_text',      value: '100+ spaces' },
        { key: 'contact_phone',   value: '+251 92 381 4125' },
        { key: 'contact_email',   value: 'info@awradesigns.com' },
        { key: 'contact_location',value: 'Addis Ababa, Ethiopia' },
        { key: 'whatsapp_number', value: '251923814125' },
        { key: 'google_maps_url', value: '' },
        { key: 'instagram_url',   value: '' },
        { key: 'facebook_url',    value: '' },
        { key: 'telegram_url',    value: '' },
        { key: 'tiktok_url',      value: '' },
      ],
    })
    console.log('✓ Settings seeded')
  } else {
    console.log(`  ${settingsCount} settings already exist — skipping`)
  }

  console.log('\n✅ Seed complete')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

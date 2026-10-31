/**
 * Reset script — wipes all content (NOT admin) and re-seeds with correct image URLs.
 * Run with: npx ts-node src/reset.ts
 */
import 'dotenv/config'
import prisma from './lib/prisma'

async function main() {
  console.log('Wiping existing content...')

  await prisma.teamMember.deleteMany()
  await prisma.blogPost.deleteMany()
  await prisma.testimonial.deleteMany()
  await prisma.project.deleteMany()
  await prisma.about.deleteMany()
  await prisma.contactMessage.deleteMany()

  console.log('✓ All content wiped')
  console.log('\nNow run: npx ts-node src/seed.ts')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

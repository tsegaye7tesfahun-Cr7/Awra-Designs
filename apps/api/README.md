# Awra Designs Backend

Production-ready REST API for Awra Designs portfolio website.

## Stack

- **Runtime**: Node.js + Express + TypeScript
- **Database**: Neon PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (Bearer tokens or httpOnly cookies)
- **Hosting**: Render

## Features

- ✅ Projects / Portfolio Management
- ✅ About Section (with team members)
- ✅ Testimonials
- ✅ Blog System (pagination, category filter, search)
- ✅ Contact Form (with rate limiting)
- ✅ Admin Authentication
- ✅ Dashboard Analytics
- ✅ Security: Helmet, CORS, Rate Limiting, Input Validation
- ✅ No Cloudinary — image URLs only

## Local Development

### Prerequisites

- Node.js 18+ and npm
- Neon PostgreSQL database

### Setup

1. Clone and navigate:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` from `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your Neon database URL and secrets:
   ```
   DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/awra_designs?sslmode=require"
   JWT_SECRET="your-long-random-secret-here"
   ADMIN_EMAIL="admin@awradesigns.com"
   ADMIN_PASSWORD="ChangeMe_Str0ng!"
   ```

5. Generate Prisma Client:
   ```bash
   npm run prisma:generate
   ```

6. Push schema to database:
   ```bash
   npx prisma db push
   ```

7. Seed admin and initial data:
   ```bash
   npm run seed
   ```

8. Start development server:
   ```bash
   npm run dev
   ```

   API runs at `http://localhost:4000`

### Available Scripts

- `npm run dev` — Development with hot reload
- `npm run build` — Compile TypeScript to `dist/`
- `npm start` — Production mode
- `npm run prisma:generate` — Generate Prisma Client
- `npm run prisma:migrate` — Deploy migrations
- `npm run prisma:studio` — Open Prisma Studio
- `npm run seed` — Seed admin + sample data

## API Endpoints

### Public

- `GET /health` — Health check
- `GET /api/projects` — Published projects (?category=&featured=true)
- `GET /api/projects/slug/:slug` — Single project by slug
- `GET /api/about` — About content
- `GET /api/testimonials` — Published testimonials (?featured=true)
- `GET /api/blog` — Published blog posts (pagination, search, category)
- `GET /api/blog/slug/:slug` — Single blog post by slug
- `POST /api/contact` — Submit contact form

### Admin (requires authentication)

**Auth**:
- `POST /api/auth/login` — Login { email, password }
- `POST /api/auth/logout` — Logout
- `GET /api/auth/me` — Current admin info

**Projects**:
- `GET /api/projects/admin/all` — All projects
- `GET /api/projects/:id` — Single project
- `POST /api/projects` — Create project
- `PUT /api/projects/:id` — Update project
- `PATCH /api/projects/:id` — Partial update (publish, feature, order)
- `DELETE /api/projects/:id` — Delete project

**About**:
- `GET /api/about/admin/all` — All versions
- `POST /api/about` — Create (replaces active)
- `PUT /api/about/:id` — Update

**Testimonials**:
- `GET /api/testimonials/admin/all` — All testimonials
- `GET /api/testimonials/:id` — Single testimonial
- `POST /api/testimonials` — Create
- `PUT /api/testimonials/:id` — Update
- `PATCH /api/testimonials/:id` — Partial update
- `DELETE /api/testimonials/:id` — Delete

**Blog**:
- `GET /api/blog/admin/all` — All blog posts
- `GET /api/blog/:id` — Single post
- `POST /api/blog` — Create
- `PUT /api/blog/:id` — Update
- `PATCH /api/blog/:id` — Partial (publish)
- `DELETE /api/blog/:id` — Delete

**Contact**:
- `GET /api/contact` — All messages (?archived=&unread=)
- `PATCH /api/contact/:id` — Mark read/archived
- `DELETE /api/contact/:id` — Delete

**Dashboard**:
- `GET /api/admin/dashboard` — Overview stats

## Deployment to Render

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full instructions.

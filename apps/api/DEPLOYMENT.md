# Awra Designs — Render Deployment Guide

## 1. Push to GitHub

Push the entire repo (Frontend, Backend, Admin) to a GitHub repository.
Make sure `.env` is in `.gitignore` — never commit it.

---

## 2. Deploy the Backend on Render

1. Go to https://render.com → **New** → **Web Service**
2. Connect your GitHub repo
3. Set the **Root Directory** to `Backend`
4. Configure:

| Setting        | Value                          |
|----------------|--------------------------------|
| Runtime        | Node                           |
| Build Command  | `npm install && npm run build && npx prisma migrate deploy` |
| Start Command  | `node dist/index.js`           |
| Instance Type  | Free (or Starter)              |

5. Add **Environment Variables**:

| Key               | Value                                      |
|-------------------|--------------------------------------------|
| `DATABASE_URL`    | Your Neon PostgreSQL connection string     |
| `JWT_SECRET`      | A long random string (32+ chars)           |
| `JWT_EXPIRES_IN`  | `7d`                                       |
| `FRONTEND_URL`    | Your deployed frontend URL (e.g. https://awradesigns.com) |
| `NODE_ENV`        | `production`                               |
| `PORT`            | `4000` (Render sets this automatically)    |

6. Click **Deploy**

---

## 3. Run the Admin Seed (first time only)

After the backend is deployed:

**Option A — Render Shell:**
1. Go to your Render service → **Shell**
2. Run:
```
ADMIN_EMAIL=admin@awradesigns.com ADMIN_PASSWORD=YourStrongPassword ts-node src/seed.ts
```

**Option B — Local (with production DATABASE_URL):**
1. Copy `.env.example` → `.env`
2. Fill in your Neon `DATABASE_URL` and set `ADMIN_EMAIL` / `ADMIN_PASSWORD`
3. Run: `npm run seed`

---

## 4. Deploy the Admin Dashboard on Render (Static Site)

1. **New** → **Static Site**
2. Root Directory: `Admin`
3. Build Command: `npm install && npm run build`
4. Publish Directory: `dist`
5. Add Environment Variable:
   - `VITE_API_URL` = `https://your-backend.onrender.com/api`

---

## 5. Deploy the Frontend on Render (Static Site) or Vercel

**Render Static Site:**
1. Root Directory: `Frontend`
2. Build Command: `npm install && npm run build`
3. Publish Directory: `dist`

**Or use Vercel/Netlify** — they auto-detect Vite.

---

## 6. Local Development

```bash
# Backend
cd Backend
cp .env.example .env        # fill in DATABASE_URL, JWT_SECRET, etc.
npm install
npx prisma generate
npx prisma migrate dev       # creates tables in Neon
npm run seed                 # creates admin + seeds data
npm run dev                  # starts on port 4000

# Admin
cd Admin
cp .env.example .env         # set VITE_API_URL=http://localhost:4000/api
npm install
npm run dev                  # starts on port 5174

# Frontend (unchanged)
cd Frontend
npm run dev                  # starts on port 5173
```

---

## 7. API Endpoints Summary

### Public
| Method | Endpoint                  | Description                     |
|--------|---------------------------|---------------------------------|
| GET    | /api/projects             | Published projects (filterable) |
| GET    | /api/projects/slug/:slug  | Single project by slug          |
| GET    | /api/about                | Active about section            |
| GET    | /api/testimonials         | Published testimonials          |
| GET    | /api/blog                 | Published posts (paginated)     |
| GET    | /api/blog/slug/:slug      | Single post by slug             |
| POST   | /api/contact              | Submit contact form             |

### Auth
| Method | Endpoint        | Description |
|--------|-----------------|-------------|
| POST   | /api/auth/login | Login       |
| POST   | /api/auth/logout| Logout      |
| GET    | /api/auth/me    | Current admin|

### Admin (all require Bearer token)
| Method | Endpoint                    | Description           |
|--------|-----------------------------|-----------------------|
| GET    | /api/admin/dashboard        | Stats overview        |
| GET    | /api/projects/admin/all     | All projects          |
| POST   | /api/projects               | Create project        |
| PUT    | /api/projects/:id           | Update project        |
| PATCH  | /api/projects/:id           | Toggle publish/feature|
| DELETE | /api/projects/:id           | Delete project        |
| GET    | /api/about/admin/all        | All about versions    |
| POST   | /api/about                  | Create about          |
| PUT    | /api/about/:id              | Update about          |
| GET    | /api/testimonials/admin/all | All testimonials      |
| POST   | /api/testimonials           | Create testimonial    |
| PUT    | /api/testimonials/:id       | Update testimonial    |
| PATCH  | /api/testimonials/:id       | Toggle publish/feature|
| DELETE | /api/testimonials/:id       | Delete testimonial    |
| GET    | /api/blog/admin/all         | All blog posts        |
| POST   | /api/blog                   | Create post           |
| PUT    | /api/blog/:id               | Update post           |
| PATCH  | /api/blog/:id               | Toggle publish        |
| DELETE | /api/blog/:id               | Delete post           |
| GET    | /api/contact                | All messages (admin)  |
| PATCH  | /api/contact/:id            | Mark read/archived    |
| DELETE | /api/contact/:id            | Delete message        |

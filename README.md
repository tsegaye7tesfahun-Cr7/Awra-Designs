# Awra Designs Monorepo

A production-ready monorepo for the Awra Designs architecture and interior design platform, containing the frontend website, backend API, and admin dashboard.

## Project Structure

```
awra-designs/
├── apps/
│   ├── web/              # Frontend website (React + Vite)
│   ├── api/              # Backend API (Express + TypeScript + Prisma)
│   └── admin/            # Admin dashboard (React + Vite)
├── package.json          # Root package.json with workspaces
├── .gitignore
└── README.md
```

## Applications

### Web (Frontend)
- **Tech Stack**: React 18, Vite, Tailwind CSS, Framer Motion
- **Port**: 5173 (dev)
- **Features**: Public website with portfolio, blog, contact forms, PWA support, premium architecture interactions
- **Deployment**: Netlify - https://awradesigns.netlify.app/

### API (Backend)
- **Tech Stack**: Express, TypeScript, Prisma ORM
- **Port**: 5000
- **Features**: REST API, authentication, content management, file uploads, analytics tracking

### Admin (Admin Dashboard)
- **Tech Stack**: React 18, Vite, Tailwind CSS, TipTap editor
- **Port**: 5174 (dev)
- **Features**: Content management, media library, project management, rich text editor, SEO preview
- **Deployment**: Netlify - https://awra-admin.netlify.app/

## Prerequisites

- Node.js 20 or higher
- npm or yarn
- PostgreSQL database (for backend)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/bereketfikre2021-sudo/awradesigns.git
cd awra-designs
```

2. Install dependencies (per app):
```bash
cd apps/web && npm install --legacy-peer-deps
cd ../api && npm install
cd ../admin && npm install
```

## Development

### Run all applications (requires 3 terminals):

**Terminal 1 - Frontend:**
```bash
cd apps/web
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd apps/api
npm run dev
```

**Terminal 3 - Admin:**
```bash
cd apps/admin
npm run dev
```

### Access URLs:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Admin**: http://localhost:5174

## Environment Variables

Each application has its own `.env` file:

- `apps/web/.env` - Frontend environment variables
- `apps/api/.env` - Backend environment variables (requires DATABASE_URL)
- `apps/admin/.env` - Admin environment variables

Example for backend (`apps/api/.env`):
```
DATABASE_URL="postgresql://user:password@localhost:5432/database"
JWT_SECRET="your-secret-key"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NODE_ENV=development
PORT=5000
```

## Database Setup (Backend)

The backend uses Prisma ORM. Set up your database:

1. Configure your database connection in `apps/api/.env`
2. Run migrations:
```bash
cd apps/api
npm run prisma:generate
```

3. (Optional) Seed the database:
```bash
npm run seed
```

## Building

Build each application individually:

**Frontend:**
```bash
cd apps/web
npm run build
```

**Backend:**
```bash
cd apps/api
npm run build
```

**Admin:**
```bash
cd apps/admin
npm run build
```

## Deployment

### Frontend (Web)
- Build output: `apps/web/dist/`
- Deploy to Netlify (already configured)

### Backend (API)
- Build output: `apps/api/dist/`
- Deploy to Render (already configured at https://awra-designs-backend.onrender.com)

### Admin (Admin Dashboard)
- Build output: `apps/admin/dist/`
- Deploy to Netlify (already configured)

## Development Notes

- All applications use relative imports within their own directories
- Frontend and Admin proxy API requests to the backend in development
- Each application can be developed and deployed independently
- Shared utilities can be added to a `packages/shared` directory if needed

## Troubleshooting

**Kill all running Node processes:**
```powershell
taskkill //F //IM node.exe
```

**Dependency issues:**
```bash
rm -rf node_modules apps/*/node_modules
cd apps/web && npm install --legacy-peer-deps
cd ../api && npm install
cd ../admin && npm install
```

**Build issues:**
- Ensure Node.js version is 20 or higher
- Clear build folders: `rm -rf apps/*/dist apps/*/dev-dist`

**Database issues:**
- Check Prisma schema: `cd apps/api && npx prisma studio`
- Regenerate Prisma client: `cd apps/api && npm run prisma:generate`

## License

ISC

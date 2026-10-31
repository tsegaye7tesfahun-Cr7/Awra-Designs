-- Add SEO fields to projects table
ALTER TABLE "projects" ADD COLUMN "seoTitle" TEXT;
ALTER TABLE "projects" ADD COLUMN "seoDesc"  TEXT;

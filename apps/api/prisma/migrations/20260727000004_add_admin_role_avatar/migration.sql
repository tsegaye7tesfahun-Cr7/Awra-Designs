-- Add role and avatar to admins table
ALTER TABLE "admins" ADD COLUMN "role"   TEXT NOT NULL DEFAULT 'admin';
ALTER TABLE "admins" ADD COLUMN "avatar" TEXT;

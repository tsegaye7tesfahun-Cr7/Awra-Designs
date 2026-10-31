-- Add scheduledAt to projects and blog_posts
ALTER TABLE "projects"   ADD COLUMN "scheduledAt" TIMESTAMP(3);
ALTER TABLE "blog_posts" ADD COLUMN "scheduledAt" TIMESTAMP(3);

-- Indexes for fast cron queries
CREATE INDEX "projects_scheduledAt_idx"   ON "projects"("scheduledAt");
CREATE INDEX "blog_posts_scheduledAt_idx" ON "blog_posts"("scheduledAt");

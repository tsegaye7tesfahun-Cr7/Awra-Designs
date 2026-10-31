-- Analytics: page_views and conversion_events tables

CREATE TABLE "page_views" (
  "id"           TEXT        NOT NULL,
  "visitorId"    TEXT        NOT NULL,
  "sessionId"    TEXT        NOT NULL,
  "section"      TEXT,
  "projectId"    TEXT,
  "blogPostId"   TEXT,
  "referrer"     TEXT,
  "source"       TEXT,
  "country"      TEXT,
  "city"         TEXT,
  "device"       TEXT,
  "browser"      TEXT,
  "os"           TEXT,
  "language"     TEXT,
  "screenWidth"  INTEGER,
  "screenHeight" INTEGER,
  "duration"     INTEGER,
  "scrollDepth"  INTEGER,
  "isNew"        BOOLEAN     NOT NULL DEFAULT true,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "page_views_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "page_views_visitorId_idx"  ON "page_views"("visitorId");
CREATE INDEX "page_views_sessionId_idx"  ON "page_views"("sessionId");
CREATE INDEX "page_views_section_idx"    ON "page_views"("section");
CREATE INDEX "page_views_createdAt_idx"  ON "page_views"("createdAt");
CREATE INDEX "page_views_source_idx"     ON "page_views"("source");
CREATE INDEX "page_views_country_idx"    ON "page_views"("country");

CREATE TABLE "conversion_events" (
  "id"        TEXT        NOT NULL,
  "visitorId" TEXT        NOT NULL,
  "sessionId" TEXT        NOT NULL,
  "type"      TEXT        NOT NULL,
  "target"    TEXT,
  "meta"      JSONB,
  "country"   TEXT,
  "device"    TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "conversion_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "conversion_events_visitorId_idx" ON "conversion_events"("visitorId");
CREATE INDEX "conversion_events_type_idx"      ON "conversion_events"("type");
CREATE INDEX "conversion_events_createdAt_idx" ON "conversion_events"("createdAt");

-- CreateTable
CREATE TABLE "activity_logs" (
    "id"          TEXT        NOT NULL,
    "adminId"     TEXT,
    "adminEmail"  TEXT,
    "action"      TEXT        NOT NULL,
    "entity"      TEXT        NOT NULL,
    "entityId"    TEXT,
    "entityName"  TEXT,
    "meta"        JSONB,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "activity_logs_entity_idx"     ON "activity_logs"("entity");
CREATE INDEX "activity_logs_createdAt_idx"  ON "activity_logs"("createdAt");

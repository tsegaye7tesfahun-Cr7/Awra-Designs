-- CreateTable
CREATE TABLE "project_groups" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "subcategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_groups_pkey" PRIMARY KEY ("id")
);

-- Seed default groups matching the current frontend config
INSERT INTO "project_groups" ("id", "label", "subcategories", "order", "updatedAt") VALUES
  (gen_random_uuid(), 'Architecture',  ARRAY['Architectural Layouts & Spatial Programming','Renovations & Transformations','Facades & Exterior 3D Designs'], 0, NOW()),
  (gen_random_uuid(), 'Residential',   ARRAY['Lounges & Family Rooms','Master Bedrooms & Suites','Kids'' Bedrooms & Nurseries','Luxury Bathrooms & Powder Rooms','Terraces & Verandas','Islamic Luxury Interiors','Gym','Steam & Sauna'], 1, NOW()),
  (gen_random_uuid(), 'Commercial',    ARRAY['Corporate Offices & Workspaces','Beauty Salons, Wellness & Retail'], 2, NOW()),
  (gen_random_uuid(), 'Outdoor',       ARRAY['Fences, Gates & Compound Seating'], 3, NOW());

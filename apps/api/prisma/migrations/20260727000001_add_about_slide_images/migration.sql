-- Add slideImages array to about table
ALTER TABLE "about" ADD COLUMN "slideImages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

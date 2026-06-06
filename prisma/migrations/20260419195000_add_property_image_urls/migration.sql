-- Add image URLs array for property photos (Cloudinary)
ALTER TABLE "Property"
ADD COLUMN "imageUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

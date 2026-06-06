-- Add structured location fields for owner property map selection
ALTER TABLE "Property"
ADD COLUMN "address" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "district" TEXT,
ADD COLUMN "neighbourhood" TEXT,
ADD COLUMN "latitude" DOUBLE PRECISION,
ADD COLUMN "longitude" DOUBLE PRECISION;

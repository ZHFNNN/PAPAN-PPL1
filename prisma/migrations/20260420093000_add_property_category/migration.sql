-- Add property category enum and field
CREATE TYPE "PropertyCategory" AS ENUM ('RUMAH', 'APARTEMEN', 'KOSAN');

ALTER TABLE "Property"
ADD COLUMN "category" "PropertyCategory" NOT NULL DEFAULT 'RUMAH';

-- CreateTable
CREATE TABLE "PropertyBoost" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "packageTitle" TEXT NOT NULL,
    "days" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyBoost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PropertyBoost_propertyId_end_date_idx" ON "PropertyBoost"("propertyId", "end_date");

-- CreateIndex
CREATE INDEX "PropertyBoost_ownerId_end_date_idx" ON "PropertyBoost"("ownerId", "end_date");

-- AddForeignKey
ALTER TABLE "PropertyBoost" ADD CONSTRAINT "PropertyBoost_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyBoost" ADD CONSTRAINT "PropertyBoost_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

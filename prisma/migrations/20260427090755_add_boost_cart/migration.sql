-- CreateTable
CREATE TABLE "BoostCart" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "packageTitle" TEXT NOT NULL,
    "days" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BoostCart_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BoostCart_ownerId_idx" ON "BoostCart"("ownerId");

-- CreateIndex
CREATE INDEX "BoostCart_propertyId_idx" ON "BoostCart"("propertyId");

-- AddForeignKey
ALTER TABLE "BoostCart" ADD CONSTRAINT "BoostCart_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoostCart" ADD CONSTRAINT "BoostCart_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

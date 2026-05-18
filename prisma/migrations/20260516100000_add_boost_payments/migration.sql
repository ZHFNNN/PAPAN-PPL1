-- CreateEnum
CREATE TYPE "BoostPaymentProvider" AS ENUM ('MIDTRANS');

-- CreateEnum
CREATE TYPE "BoostPaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'EXPIRED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "BoostPayment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "provider" "BoostPaymentProvider" NOT NULL DEFAULT 'MIDTRANS',
    "status" "BoostPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "paymentType" TEXT,
    "subtotal" INTEGER NOT NULL,
    "adminFee" INTEGER NOT NULL DEFAULT 0,
    "grossAmount" INTEGER NOT NULL,
    "providerTransactionId" TEXT,
    "snapToken" TEXT,
    "redirectUrl" TEXT,
    "rawRequest" JSONB,
    "rawResponse" JSONB,
    "settledAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoostPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoostPaymentItem" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "propertyTitle" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "packageTitle" TEXT NOT NULL,
    "days" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BoostPaymentItem_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "PropertyBoost" ADD COLUMN "paymentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "BoostPayment_orderId_key" ON "BoostPayment"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "BoostPayment_providerTransactionId_key" ON "BoostPayment"("providerTransactionId");

-- CreateIndex
CREATE INDEX "BoostPayment_ownerId_createdAt_idx" ON "BoostPayment"("ownerId", "createdAt");

-- CreateIndex
CREATE INDEX "BoostPayment_status_createdAt_idx" ON "BoostPayment"("status", "createdAt");

-- CreateIndex
CREATE INDEX "BoostPaymentItem_paymentId_idx" ON "BoostPaymentItem"("paymentId");

-- CreateIndex
CREATE INDEX "BoostPaymentItem_propertyId_idx" ON "BoostPaymentItem"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyBoost_paymentId_idx" ON "PropertyBoost"("paymentId");

-- AddForeignKey
ALTER TABLE "BoostPayment" ADD CONSTRAINT "BoostPayment_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoostPaymentItem" ADD CONSTRAINT "BoostPaymentItem_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "BoostPayment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoostPaymentItem" ADD CONSTRAINT "BoostPaymentItem_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyBoost" ADD CONSTRAINT "PropertyBoost_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "BoostPayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

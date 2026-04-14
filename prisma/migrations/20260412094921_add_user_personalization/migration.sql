-- CreateTable
CREATE TABLE "UserPersonalization" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "location" TEXT,
    "occupation" TEXT,
    "budgetMin" INTEGER,
    "budgetMax" INTEGER,
    "gender" TEXT,
    "prefFurnished" BOOLEAN NOT NULL DEFAULT false,
    "prefUnfurnished" BOOLEAN NOT NULL DEFAULT false,
    "prefPetFriendly" BOOLEAN NOT NULL DEFAULT false,
    "prefParkirMobil" BOOLEAN NOT NULL DEFAULT false,
    "prefAc" BOOLEAN NOT NULL DEFAULT false,
    "prefWaterHeater" BOOLEAN NOT NULL DEFAULT false,
    "prefDekatTransportasi" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPersonalization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPersonalization_userId_key" ON "UserPersonalization"("userId");

-- AddForeignKey
ALTER TABLE "UserPersonalization" ADD CONSTRAINT "UserPersonalization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

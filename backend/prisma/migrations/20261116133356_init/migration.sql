-- CreateTable
CREATE TABLE "Species" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "nameZh" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "scientificName" TEXT NOT NULL,
    "family" TEXT NOT NULL,
    "native" BOOLEAN NOT NULL DEFAULT true,
    "invasiveRisk" TEXT,
    "iucnStatus" TEXT NOT NULL,
    "chinaProtection" TEXT,
    "distribution" TEXT NOT NULL,
    "distributionZh" TEXT NOT NULL,
    "distributionEn" TEXT NOT NULL,
    "habitatZh" TEXT NOT NULL,
    "habitatEn" TEXT NOT NULL,
    "descriptionZh" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "threatZh" TEXT,
    "threatEn" TEXT,
    "imageUrl" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "IdentifyRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "imageName" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Species_slug_key" ON "Species"("slug");

-- CreateIndex
CREATE INDEX "Species_category_idx" ON "Species"("category");

-- CreateIndex
CREATE INDEX "Species_group_idx" ON "Species"("group");

-- CreateIndex
CREATE INDEX "Species_iucnStatus_idx" ON "Species"("iucnStatus");

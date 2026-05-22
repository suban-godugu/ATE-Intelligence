-- ATE Intelligence Step 2 Migration
-- Generated SQL equivalent for PostgreSQL (run with: prisma migrate dev --name step2_full_schema)
-- This is the reference SQL for when PostgreSQL / Docker is available.

-- CreateEnum
CREATE TYPE "PatternType" AS ENUM ('SCAN', 'ATPG', 'BIST', 'FUNCTIONAL', 'IDDQ', 'BOUNDARY');
CREATE TYPE "PatternAction" AS ENUM ('KEEP', 'REVIEW', 'REMOVE');
CREATE TYPE "DetectPower" AS ENUM ('HIGH', 'MEDIUM', 'LOW');
CREATE TYPE "ChainStatus" AS ENUM ('HEALTHY', 'IMBALANCED', 'BROKEN');
CREATE TYPE "ChainType" AS ENUM ('FULL', 'PARTIAL', 'EDT');
CREATE TYPE "FaultModel" AS ENUM ('STUCK_AT', 'TRANSITION', 'PATH_DELAY', 'BRIDGING', 'CELL_AWARE', 'IDDQ', 'FUNCTIONAL');

-- CreateTable Lot
CREATE TABLE "Lot" (
    "id"        TEXT    NOT NULL,
    "lotNumber" TEXT    NOT NULL,
    "product"   TEXT    NOT NULL,
    "fab"       TEXT    NOT NULL,
    "tester"    TEXT    NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate"   TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Lot_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Lot_lotNumber_key" ON "Lot"("lotNumber");
CREATE INDEX "Lot_lotNumber_idx" ON "Lot"("lotNumber");

-- CreateTable Pattern
CREATE TABLE "Pattern" (
    "id"            TEXT          NOT NULL,
    "patternId"     TEXT          NOT NULL,
    "name"          TEXT,
    "type"          "PatternType" NOT NULL,
    "domain"        TEXT          NOT NULL,
    "testTimeMs"    DOUBLE PRECISION NOT NULL,
    "costPerDie"    DOUBLE PRECISION NOT NULL,
    "faultCoverage" DOUBLE PRECISION NOT NULL,
    "failRate"      DOUBLE PRECISION NOT NULL,
    "killRatio"     DOUBLE PRECISION NOT NULL,
    "detectPower"   "DetectPower" NOT NULL,
    "action"        "PatternAction" NOT NULL,
    "lotId"         TEXT          NOT NULL,
    "createdAt"     TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3)  NOT NULL,
    CONSTRAINT "Pattern_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Pattern_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "Lot"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Pattern_patternId_key" ON "Pattern"("patternId");
CREATE INDEX "Pattern_lotId_idx" ON "Pattern"("lotId");
CREATE INDEX "Pattern_type_idx" ON "Pattern"("type");
CREATE INDEX "Pattern_action_idx" ON "Pattern"("action");
CREATE INDEX "Pattern_detectPower_idx" ON "Pattern"("detectPower");

-- CreateTable FaultCoverage
CREATE TABLE "FaultCoverage" (
    "id"         TEXT          NOT NULL,
    "patternId"  TEXT          NOT NULL,
    "model"      "FaultModel"  NOT NULL,
    "coverage"   DOUBLE PRECISION NOT NULL,
    "detected"   INTEGER       NOT NULL,
    "undetected" INTEGER       NOT NULL,
    "untestable" INTEGER       NOT NULL,
    CONSTRAINT "FaultCoverage_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "FaultCoverage_patternId_fkey" FOREIGN KEY ("patternId") REFERENCES "Pattern"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "FaultCoverage_patternId_idx" ON "FaultCoverage"("patternId");
CREATE INDEX "FaultCoverage_model_idx" ON "FaultCoverage"("model");

-- CreateTable ScanChain
CREATE TABLE "ScanChain" (
    "id"             TEXT          NOT NULL,
    "chainId"        TEXT          NOT NULL,
    "cellCount"      INTEGER       NOT NULL,
    "domain"         TEXT          NOT NULL,
    "chainType"      "ChainType"   NOT NULL,
    "balancePercent" DOUBLE PRECISION NOT NULL,
    "status"         "ChainStatus" NOT NULL,
    "lotId"          TEXT          NOT NULL,
    CONSTRAINT "ScanChain_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ScanChain_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "Lot"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ScanChain_chainId_key" ON "ScanChain"("chainId");
CREATE INDEX "ScanChain_lotId_idx" ON "ScanChain"("lotId");
CREATE INDEX "ScanChain_status_idx" ON "ScanChain"("status");

-- CreateTable ScanChainPattern
CREATE TABLE "ScanChainPattern" (
    "scanChainId" TEXT NOT NULL,
    "patternId"   TEXT NOT NULL,
    CONSTRAINT "ScanChainPattern_pkey" PRIMARY KEY ("scanChainId","patternId"),
    CONSTRAINT "ScanChainPattern_scanChainId_fkey" FOREIGN KEY ("scanChainId") REFERENCES "ScanChain"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ScanChainPattern_patternId_fkey" FOREIGN KEY ("patternId") REFERENCES "Pattern"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable WaferRun
CREATE TABLE "WaferRun" (
    "id"      TEXT NOT NULL,
    "waferId" TEXT NOT NULL,
    "lotId"   TEXT NOT NULL,
    "zone"    TEXT NOT NULL,
    CONSTRAINT "WaferRun_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "WaferRun_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "Lot"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "WaferRun_lotId_idx" ON "WaferRun"("lotId");
CREATE INDEX "WaferRun_waferId_idx" ON "WaferRun"("waferId");

-- CreateTable DieResult
CREATE TABLE "DieResult" (
    "id"          TEXT          NOT NULL,
    "waferRunId"  TEXT          NOT NULL,
    "dieX"        INTEGER       NOT NULL,
    "dieY"        INTEGER       NOT NULL,
    "passed"      BOOLEAN       NOT NULL,
    "failPattern" TEXT,
    "testTimeMs"  DOUBLE PRECISION NOT NULL,
    CONSTRAINT "DieResult_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "DieResult_waferRunId_fkey" FOREIGN KEY ("waferRunId") REFERENCES "WaferRun"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "DieResult_waferRunId_idx" ON "DieResult"("waferRunId");
CREATE INDEX "DieResult_passed_idx" ON "DieResult"("passed");

-- CreateTable RedundancyGroup
CREATE TABLE "RedundancyGroup" (
    "id"       TEXT     NOT NULL,
    "groupId"  TEXT     NOT NULL,
    "patterns" TEXT[]   NOT NULL,
    "overlap"  DOUBLE PRECISION NOT NULL,
    "keepId"   TEXT     NOT NULL,
    "lotId"    TEXT     NOT NULL,
    CONSTRAINT "RedundancyGroup_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "RedundancyGroup_lotId_idx" ON "RedundancyGroup"("lotId");

-- CreateTable User
CREATE TABLE "User" (
    "id"           TEXT     NOT NULL,
    "email"        TEXT     NOT NULL,
    "passwordHash" TEXT     NOT NULL,
    "name"         TEXT     NOT NULL,
    "role"         TEXT     NOT NULL DEFAULT 'engineer',
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");

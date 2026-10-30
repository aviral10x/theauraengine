-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "credits" INTEGER NOT NULL DEFAULT 0,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "stripeCustomerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "anonId" TEXT,
    "ip" TEXT,
    "url" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scanned',
    "crawl" TEXT NOT NULL,
    "dna" TEXT NOT NULL,
    "conceptIdx" INTEGER,
    "formatId" TEXT,
    "aspect" TEXT NOT NULL DEFAULT '9:16',
    "series" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Episode" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "outline" TEXT NOT NULL,
    "script" TEXT,
    "finalUrl" TEXT,
    "stitchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Episode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shot" (
    "id" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "shotType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imagePrompt" TEXT NOT NULL,
    "motionPrompt" TEXT NOT NULL,
    "dialogue" TEXT,
    "onScreenText" TEXT,
    "characters" TEXT NOT NULL DEFAULT '[]',
    "frameUrl" TEXT,
    "frameInput" TEXT,
    "frameStatus" TEXT NOT NULL DEFAULT 'none',
    "videoUrl" TEXT,
    "videoStatus" TEXT NOT NULL DEFAULT 'none',
    "error" TEXT,

    CONSTRAINT "Shot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Generation" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT,
    "kind" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "requestId" TEXT,
    "statusUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "input" TEXT NOT NULL,
    "outputUrl" TEXT,
    "archivedUrl" TEXT,
    "credits" INTEGER NOT NULL DEFAULT 0,
    "refunded" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Generation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditLedger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "refId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "url" TEXT,
    "budget" TEXT,
    "message" TEXT,
    "projectId" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "Project_userId_idx" ON "Project"("userId");

-- CreateIndex
CREATE INDEX "Project_anonId_idx" ON "Project"("anonId");

-- CreateIndex
CREATE INDEX "Project_ip_createdAt_idx" ON "Project"("ip", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Episode_projectId_number_key" ON "Episode"("projectId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "Shot_episodeId_index_key" ON "Shot"("episodeId", "index");

-- CreateIndex
CREATE UNIQUE INDEX "Generation_requestId_key" ON "Generation"("requestId");

-- CreateIndex
CREATE INDEX "Generation_projectId_status_idx" ON "Generation"("projectId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CreditLedger_refId_key" ON "CreditLedger"("refId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shot" ADD CONSTRAINT "Shot_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Generation" ADD CONSTRAINT "Generation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditLedger" ADD CONSTRAINT "CreditLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

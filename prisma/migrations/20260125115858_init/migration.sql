-- CreateTable
CREATE TABLE "ContactForms" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formType" TEXT NOT NULL DEFAULT 'contact',
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "inquiryType" TEXT,
    "subject" TEXT,
    "message" TEXT,
    "source" TEXT,
    "pagePath" TEXT NOT NULL,
    "pageUrl" TEXT NOT NULL,
    "referrer" TEXT,
    "meta" JSONB,

    CONSTRAINT "ContactForms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareersForms" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formType" TEXT NOT NULL DEFAULT 'careers',
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "areaOfInterest" TEXT NOT NULL,
    "background" TEXT NOT NULL,
    "source" TEXT,
    "pagePath" TEXT NOT NULL,
    "pageUrl" TEXT NOT NULL,
    "referrer" TEXT,
    "meta" JSONB,

    CONSTRAINT "CareersForms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterForms" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formType" TEXT NOT NULL DEFAULT 'newsletter',
    "email" TEXT NOT NULL,
    "source" TEXT,
    "pagePath" TEXT NOT NULL,
    "pageUrl" TEXT NOT NULL,
    "referrer" TEXT,
    "meta" JSONB,

    CONSTRAINT "NewsletterForms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leads" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "reportSlug" TEXT NOT NULL,
    "reportTitle" TEXT,
    "reportIndustry" TEXT,
    "formType" TEXT NOT NULL,
    "source" TEXT,
    "pagePath" TEXT NOT NULL,
    "pageUrl" TEXT NOT NULL,
    "referrer" TEXT,
    "crmSyncStatus" TEXT NOT NULL DEFAULT 'pending',
    "crmSyncedAt" TIMESTAMPTZ(3),
    "crmError" TEXT,
    "meta" JSONB,

    CONSTRAINT "Leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DownloadToken" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tokenHash" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "usedAt" TIMESTAMPTZ(3),
    "leadId" TEXT,
    "reportSlug" TEXT,
    "meta" JSONB,

    CONSTRAINT "DownloadToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionIndex" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formType" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "reportSlug" TEXT,
    "source" TEXT,
    "pagePath" TEXT NOT NULL,
    "pageUrl" TEXT NOT NULL,
    "referrer" TEXT,
    "status" TEXT,
    "meta" JSONB,
    "sourceTable" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,

    CONSTRAINT "SubmissionIndex_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContactForms_email_idx" ON "ContactForms"("email");

-- CreateIndex
CREATE INDEX "CareersForms_email_idx" ON "CareersForms"("email");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterForms_email_key" ON "NewsletterForms"("email");

-- CreateIndex
CREATE INDEX "Leads_email_idx" ON "Leads"("email");

-- CreateIndex
CREATE INDEX "Leads_reportSlug_idx" ON "Leads"("reportSlug");

-- CreateIndex
CREATE UNIQUE INDEX "DownloadToken_tokenHash_key" ON "DownloadToken"("tokenHash");

-- CreateIndex
CREATE INDEX "DownloadToken_expiresAt_idx" ON "DownloadToken"("expiresAt");

-- CreateIndex
CREATE INDEX "DownloadToken_reportSlug_idx" ON "DownloadToken"("reportSlug");

-- CreateIndex
CREATE INDEX "SubmissionIndex_email_idx" ON "SubmissionIndex"("email");

-- CreateIndex
CREATE INDEX "SubmissionIndex_formType_idx" ON "SubmissionIndex"("formType");

-- CreateIndex
CREATE INDEX "SubmissionIndex_source_idx" ON "SubmissionIndex"("source");

-- CreateIndex
CREATE UNIQUE INDEX "SubmissionIndex_sourceTable_sourceId_key" ON "SubmissionIndex"("sourceTable", "sourceId");

-- AddForeignKey
ALTER TABLE "DownloadToken" ADD CONSTRAINT "DownloadToken_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

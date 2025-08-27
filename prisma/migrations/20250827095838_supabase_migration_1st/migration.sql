-- CreateEnum
CREATE TYPE "public"."FieldType" AS ENUM ('TEXT', 'NUMBER', 'DROPDOWN', 'DATE', 'DATE_RANGE', 'CHECKBOX', 'FILE_UPLOAD', 'EMAIL', 'PHONE', 'URL', 'TEXTAREA', 'CURRENCY');

-- CreateEnum
CREATE TYPE "public"."ActivityStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ActivityType" AS ENUM ('CALL', 'EMAIL', 'MEETING', 'TASK', 'NOTE', 'PROPOSAL_SENT', 'CONTRACT_SENT', 'FOLLOW_UP', 'DEMO', 'PRESENTATION', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."ContactPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."ContactStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."ContactType" AS ENUM ('INDIVIDUAL', 'COMPANY', 'VENDOR', 'PARTNER');

-- CreateEnum
CREATE TYPE "public"."LeadSource" AS ENUM ('WEBSITE', 'SOCIAL_MEDIA', 'EMAIL_CAMPAIGN', 'COLD_CALL', 'REFERRAL', 'TRADE_SHOW', 'ADVERTISEMENT', 'PARTNER', 'ORGANIC_SEARCH', 'PAID_SEARCH', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."LeadStatus" AS ENUM ('NEW', 'QUALIFIED', 'FOLLOWUP', 'CONTACTED', 'QUALIFIED_OPPORTUNITY', 'NOT_QUALIFIED', 'ON_HOLD', 'LOST');

-- CreateEnum
CREATE TYPE "public"."LeadType" AS ENUM ('QUERY', 'HOT', 'WARM', 'COLD');

-- CreateEnum
CREATE TYPE "public"."OpportunityStage" AS ENUM ('NEW_QUALIFIED', 'DISCOVERY', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST');

-- AlterTable
ALTER TABLE "public"."companies" ADD COLUMN     "themeColor" TEXT DEFAULT '#004aad';

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "middleName" TEXT;

-- CreateTable
CREATE TABLE "public"."custom_fields" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "fieldType" "public"."FieldType" NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "options" JSONB,
    "validation" JSONB,
    "placeholder" TEXT,
    "helpText" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "companyId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."activities" (
    "id" TEXT NOT NULL,
    "type" "public"."ActivityType" NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."ActivityStatus" NOT NULL DEFAULT 'PLANNED',
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "location" TEXT,
    "meetingLink" TEXT,
    "companyId" TEXT NOT NULL,
    "contactId" TEXT,
    "leadId" TEXT,
    "opportunityId" TEXT,
    "assignedToId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contacts" (
    "id" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "secondaryPhone" TEXT,
    "companyName" TEXT,
    "jobTitle" TEXT,
    "department" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "zipCode" TEXT,
    "contactType" "public"."ContactType" NOT NULL DEFAULT 'INDIVIDUAL',
    "priority" "public"."ContactPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "public"."ContactStatus" NOT NULL DEFAULT 'ACTIVE',
    "website" TEXT,
    "linkedinUrl" TEXT,
    "twitterHandle" TEXT,
    "source" TEXT,
    "tags" TEXT[],
    "notes" TEXT,
    "accountValue" DECIMAL(12,2),
    "currency" TEXT DEFAULT 'USD',
    "lastInteractionAt" TIMESTAMP(3),
    "lastInteractionType" TEXT,
    "interactionCount" INTEGER NOT NULL DEFAULT 0,
    "companyId" TEXT NOT NULL,
    "assignedToId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contact_field_values" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "customFieldId" TEXT NOT NULL,
    "textValue" TEXT,
    "numberValue" DECIMAL(15,4),
    "dateValue" TIMESTAMP(3),
    "booleanValue" BOOLEAN,
    "jsonValue" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_field_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."leads" (
    "id" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "companyName" TEXT,
    "jobTitle" TEXT,
    "companySize" TEXT,
    "industry" TEXT,
    "leadType" "public"."LeadType" NOT NULL DEFAULT 'COLD',
    "status" "public"."LeadStatus" NOT NULL DEFAULT 'NEW',
    "source" "public"."LeadSource" NOT NULL DEFAULT 'OTHER',
    "budget" DECIMAL(12,2),
    "currency" TEXT DEFAULT 'USD',
    "timeline" TEXT,
    "decisionMaker" BOOLEAN NOT NULL DEFAULT false,
    "painPoints" TEXT[],
    "productInterest" TEXT[],
    "urgencyLevel" INTEGER NOT NULL DEFAULT 1,
    "qualificationScore" DECIMAL(3,2),
    "preferredContactMethod" TEXT,
    "notes" TEXT,
    "tags" TEXT[],
    "lastInteractionAt" TIMESTAMP(3),
    "lastInteractionType" TEXT,
    "nextFollowUpAt" TIMESTAMP(3),
    "interactionCount" INTEGER NOT NULL DEFAULT 0,
    "convertedAt" TIMESTAMP(3),
    "conversionValue" DECIMAL(12,2),
    "companyId" TEXT NOT NULL,
    "contactId" TEXT,
    "assignedToId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lead_field_values" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "customFieldId" TEXT NOT NULL,
    "textValue" TEXT,
    "numberValue" DECIMAL(15,4),
    "dateValue" TIMESTAMP(3),
    "booleanValue" BOOLEAN,
    "jsonValue" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_field_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."opportunities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "probability" INTEGER NOT NULL DEFAULT 50,
    "expectedCloseDate" TIMESTAMP(3),
    "actualCloseDate" TIMESTAMP(3),
    "stage" "public"."OpportunityStage" NOT NULL DEFAULT 'NEW_QUALIFIED',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "competitorInfo" TEXT,
    "lossReason" TEXT,
    "companyId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "assignedToId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "custom_fields_companyId_entityType_fieldKey_key" ON "public"."custom_fields"("companyId", "entityType", "fieldKey");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_companyId_email_key" ON "public"."contacts"("companyId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "contact_field_values_contactId_customFieldId_key" ON "public"."contact_field_values"("contactId", "customFieldId");

-- CreateIndex
CREATE UNIQUE INDEX "leads_companyId_email_key" ON "public"."leads"("companyId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "lead_field_values_leadId_customFieldId_key" ON "public"."lead_field_values"("leadId", "customFieldId");

-- CreateIndex
CREATE UNIQUE INDEX "opportunities_leadId_key" ON "public"."opportunities"("leadId");

-- AddForeignKey
ALTER TABLE "public"."custom_fields" ADD CONSTRAINT "custom_fields_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "public"."contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "public"."opportunities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "public"."company_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."company_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contacts" ADD CONSTRAINT "contacts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contacts" ADD CONSTRAINT "contacts_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "public"."company_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contacts" ADD CONSTRAINT "contacts_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."company_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contact_field_values" ADD CONSTRAINT "contact_field_values_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "public"."contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contact_field_values" ADD CONSTRAINT "contact_field_values_customFieldId_fkey" FOREIGN KEY ("customFieldId") REFERENCES "public"."custom_fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leads" ADD CONSTRAINT "leads_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leads" ADD CONSTRAINT "leads_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "public"."contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leads" ADD CONSTRAINT "leads_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "public"."company_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leads" ADD CONSTRAINT "leads_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."company_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lead_field_values" ADD CONSTRAINT "lead_field_values_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lead_field_values" ADD CONSTRAINT "lead_field_values_customFieldId_fkey" FOREIGN KEY ("customFieldId") REFERENCES "public"."custom_fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."opportunities" ADD CONSTRAINT "opportunities_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."opportunities" ADD CONSTRAINT "opportunities_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."opportunities" ADD CONSTRAINT "opportunities_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "public"."contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."opportunities" ADD CONSTRAINT "opportunities_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "public"."company_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."opportunities" ADD CONSTRAINT "opportunities_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."company_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

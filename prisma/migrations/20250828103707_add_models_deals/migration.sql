/*
  Warnings:

  - A unique constraint covering the columns `[clientId]` on the table `contacts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[clientId]` on the table `leads` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[clientId]` on the table `opportunities` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."ClientStage" AS ENUM ('CONTACT_ONLY', 'LEAD', 'OPPORTUNITY');

-- CreateEnum
CREATE TYPE "public"."DealPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."DealStatus" AS ENUM ('DRAFT', 'ACTIVE', 'WON', 'LOST', 'ON_HOLD', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "public"."opportunities" DROP CONSTRAINT "opportunities_leadId_fkey";

-- AlterTable
ALTER TABLE "public"."activities" ADD COLUMN     "clientId" TEXT,
ADD COLUMN     "dealId" TEXT;

-- AlterTable
ALTER TABLE "public"."contacts" ADD COLUMN     "clientId" TEXT;

-- AlterTable
ALTER TABLE "public"."leads" ADD COLUMN     "clientId" TEXT;

-- AlterTable
ALTER TABLE "public"."opportunities" ADD COLUMN     "clientId" TEXT,
ALTER COLUMN "leadId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."clients" (
    "id" TEXT NOT NULL,
    "currentStage" "public"."ClientStage" NOT NULL DEFAULT 'CONTACT_ONLY',
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "companyName" TEXT,
    "contactId" TEXT,
    "leadId" TEXT,
    "opportunityId" TEXT,
    "companyId" TEXT NOT NULL,
    "assignedToId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."client_field_values" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "customFieldId" TEXT NOT NULL,
    "textValue" TEXT,
    "numberValue" DECIMAL(15,4),
    "dateValue" TIMESTAMP(3),
    "booleanValue" BOOLEAN,
    "jsonValue" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_field_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."deals" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "value" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "public"."DealStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" "public"."DealPriority" NOT NULL DEFAULT 'MEDIUM',
    "expectedCloseDate" TIMESTAMP(3),
    "actualCloseDate" TIMESTAMP(3),
    "terms" TEXT,
    "notes" TEXT,
    "lossReason" TEXT,
    "companyId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "contactId" TEXT,
    "assignedToId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."deal_field_values" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "customFieldId" TEXT NOT NULL,
    "textValue" TEXT,
    "numberValue" DECIMAL(15,4),
    "dateValue" TIMESTAMP(3),
    "booleanValue" BOOLEAN,
    "jsonValue" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deal_field_values_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_contactId_key" ON "public"."clients"("contactId");

-- CreateIndex
CREATE UNIQUE INDEX "clients_leadId_key" ON "public"."clients"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "clients_opportunityId_key" ON "public"."clients"("opportunityId");

-- CreateIndex
CREATE UNIQUE INDEX "clients_companyId_email_key" ON "public"."clients"("companyId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "client_field_values_clientId_customFieldId_key" ON "public"."client_field_values"("clientId", "customFieldId");

-- CreateIndex
CREATE UNIQUE INDEX "deal_field_values_dealId_customFieldId_key" ON "public"."deal_field_values"("dealId", "customFieldId");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_clientId_key" ON "public"."contacts"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "leads_clientId_key" ON "public"."leads"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "opportunities_clientId_key" ON "public"."opportunities"("clientId");

-- AddForeignKey
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "public"."deals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."clients" ADD CONSTRAINT "clients_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."clients" ADD CONSTRAINT "clients_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "public"."company_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."clients" ADD CONSTRAINT "clients_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."company_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."client_field_values" ADD CONSTRAINT "client_field_values_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."client_field_values" ADD CONSTRAINT "client_field_values_customFieldId_fkey" FOREIGN KEY ("customFieldId") REFERENCES "public"."custom_fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contacts" ADD CONSTRAINT "contacts_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."deals" ADD CONSTRAINT "deals_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."deals" ADD CONSTRAINT "deals_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."deals" ADD CONSTRAINT "deals_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "public"."opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."deals" ADD CONSTRAINT "deals_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "public"."contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."deals" ADD CONSTRAINT "deals_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "public"."company_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."deals" ADD CONSTRAINT "deals_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."company_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."deal_field_values" ADD CONSTRAINT "deal_field_values_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "public"."deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."deal_field_values" ADD CONSTRAINT "deal_field_values_customFieldId_fkey" FOREIGN KEY ("customFieldId") REFERENCES "public"."custom_fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leads" ADD CONSTRAINT "leads_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."opportunities" ADD CONSTRAINT "opportunities_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."opportunities" ADD CONSTRAINT "opportunities_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

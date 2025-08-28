/*
  Warnings:

  - You are about to drop the column `isDefault` on the `company_roles` table. All the data in the column will be lost.
  - You are about to drop the column `isSystem` on the `company_roles` table. All the data in the column will be lost.
  - You are about to drop the column `avatar` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `middleName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `attendance_records` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `departments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `employees` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `leave_requests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `role_permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_company_roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_profiles` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `company_roles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `company_users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId]` on the table `company_users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."attendance_records" DROP CONSTRAINT "attendance_records_companyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."attendance_records" DROP CONSTRAINT "attendance_records_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."company_users" DROP CONSTRAINT "company_users_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."departments" DROP CONSTRAINT "departments_companyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."departments" DROP CONSTRAINT "departments_parentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."employees" DROP CONSTRAINT "employees_companyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."employees" DROP CONSTRAINT "employees_companyUserId_fkey";

-- DropForeignKey
ALTER TABLE "public"."employees" DROP CONSTRAINT "employees_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."employees" DROP CONSTRAINT "employees_managerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."leave_requests" DROP CONSTRAINT "leave_requests_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."role_permissions" DROP CONSTRAINT "role_permissions_companyRoleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."role_permissions" DROP CONSTRAINT "role_permissions_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_company_roles" DROP CONSTRAINT "user_company_roles_companyRoleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_company_roles" DROP CONSTRAINT "user_company_roles_companyUserId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_profiles" DROP CONSTRAINT "user_profiles_userId_fkey";

-- DropIndex
DROP INDEX "public"."company_roles_companyId_name_key";

-- DropIndex
DROP INDEX "public"."company_users_userId_companyId_key";

-- AlterTable
ALTER TABLE "public"."company_roles" DROP COLUMN "isDefault",
DROP COLUMN "isSystem",
ADD COLUMN     "permissions" TEXT[];

-- AlterTable
ALTER TABLE "public"."company_users" ADD COLUMN     "assignedToId" TEXT,
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "middleName" TEXT;

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "avatar",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "middleName";

-- DropTable
DROP TABLE "public"."attendance_records";

-- DropTable
DROP TABLE "public"."departments";

-- DropTable
DROP TABLE "public"."employees";

-- DropTable
DROP TABLE "public"."leave_requests";

-- DropTable
DROP TABLE "public"."permissions";

-- DropTable
DROP TABLE "public"."role_permissions";

-- DropTable
DROP TABLE "public"."user_company_roles";

-- DropTable
DROP TABLE "public"."user_profiles";

-- CreateIndex
CREATE UNIQUE INDEX "company_roles_name_key" ON "public"."company_roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "company_users_userId_key" ON "public"."company_users"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "company_users_companyId_key" ON "public"."company_users"("companyId");

-- AddForeignKey
ALTER TABLE "public"."company_users" ADD CONSTRAINT "company_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."company_users" ADD CONSTRAINT "company_users_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "public"."company_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

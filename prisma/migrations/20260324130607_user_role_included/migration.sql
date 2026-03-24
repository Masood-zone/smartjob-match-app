/*
  Warnings:

  - You are about to drop the column `address` on the `Employer` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `Employer` table. All the data in the column will be lost.
  - You are about to drop the column `companyEmail` on the `Employer` table. All the data in the column will be lost.
  - You are about to drop the column `companySize` on the `Employer` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Employer` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Employer` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Employer` table. All the data in the column will be lost.
  - You are about to drop the column `industry` on the `Employer` table. All the data in the column will be lost.
  - You are about to drop the column `logoUrl` on the `Employer` table. All the data in the column will be lost.
  - You are about to drop the column `onboardingStatus` on the `Employer` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `Employer` table. All the data in the column will be lost.
  - You are about to drop the column `registrationDocUrl` on the `Employer` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Employer` table. All the data in the column will be lost.
  - You are about to drop the column `taxDocUrl` on the `Employer` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Employer` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `Employer` table. All the data in the column will be lost.
  - You are about to drop the column `yearEstablished` on the `Employer` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `JobSeeker` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `JobSeeker` table. All the data in the column will be lost.
  - You are about to drop the column `locationPreference` on the `JobSeeker` table. All the data in the column will be lost.
  - You are about to drop the column `onboardingStatus` on the `JobSeeker` table. All the data in the column will be lost.
  - You are about to drop the column `professionalEmail` on the `JobSeeker` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `JobSeeker` table. All the data in the column will be lost.
  - You are about to drop the `Education` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Experience` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `qualification` on table `JobSeeker` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'USER';

-- DropForeignKey
ALTER TABLE "Education" DROP CONSTRAINT "Education_jobSeekerId_fkey";

-- DropForeignKey
ALTER TABLE "Experience" DROP CONSTRAINT "Experience_jobSeekerId_fkey";

-- AlterTable
ALTER TABLE "Employer" DROP COLUMN "address",
DROP COLUMN "city",
DROP COLUMN "companyEmail",
DROP COLUMN "companySize",
DROP COLUMN "country",
DROP COLUMN "createdAt",
DROP COLUMN "description",
DROP COLUMN "industry",
DROP COLUMN "logoUrl",
DROP COLUMN "onboardingStatus",
DROP COLUMN "phoneNumber",
DROP COLUMN "registrationDocUrl",
DROP COLUMN "status",
DROP COLUMN "taxDocUrl",
DROP COLUMN "updatedAt",
DROP COLUMN "website",
DROP COLUMN "yearEstablished",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'JOB_SEEKER';

-- AlterTable
ALTER TABLE "JobSeeker" DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "locationPreference",
DROP COLUMN "onboardingStatus",
DROP COLUMN "professionalEmail",
DROP COLUMN "updatedAt",
ALTER COLUMN "qualification" SET NOT NULL;

-- DropTable
DROP TABLE "Education";

-- DropTable
DROP TABLE "Experience";

-- DropEnum
DROP TYPE "EmployerStatus";

-- DropEnum
DROP TYPE "OnboardingStatus";

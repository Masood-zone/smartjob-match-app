/*
  Warnings:

  - Added the required column `updatedAt` to the `Employer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `JobSeeker` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "EmployerStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Employer" ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "companyEmail" TEXT,
ADD COLUMN     "companySize" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "onboardingStatus" "OnboardingStatus" NOT NULL DEFAULT 'NOT_STARTED',
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "registrationDocUrl" TEXT,
ADD COLUMN     "status" "EmployerStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "taxDocUrl" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "website" TEXT,
ADD COLUMN     "yearEstablished" INTEGER;

-- AlterTable
ALTER TABLE "JobSeeker" ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "locationPreference" TEXT,
ADD COLUMN     "onboardingStatus" "OnboardingStatus" NOT NULL DEFAULT 'NOT_STARTED',
ADD COLUMN     "professionalEmail" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "qualification" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Experience" (
    "id" TEXT NOT NULL,
    "jobSeekerId" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Education" (
    "id" TEXT NOT NULL,
    "jobSeekerId" TEXT NOT NULL,
    "qualification" "QualificationLevel" NOT NULL,
    "institution" TEXT NOT NULL,
    "yearCompleted" INTEGER NOT NULL,
    "grade" TEXT,
    "skills" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_jobSeekerId_fkey" FOREIGN KEY ("jobSeekerId") REFERENCES "JobSeeker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Education" ADD CONSTRAINT "Education_jobSeekerId_fkey" FOREIGN KEY ("jobSeekerId") REFERENCES "JobSeeker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "employer_onboarding" ADD COLUMN     "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "job_seeker_onboarding" ADD COLUMN     "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "algorithm_config" (
    "id" TEXT NOT NULL,
    "qualificationWeight" INTEGER NOT NULL,
    "skillsWeight" INTEGER NOT NULL,
    "experienceWeight" INTEGER NOT NULL,
    "preferenceWeight" INTEGER NOT NULL,
    "strictQualification" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "algorithm_config_pkey" PRIMARY KEY ("id")
);

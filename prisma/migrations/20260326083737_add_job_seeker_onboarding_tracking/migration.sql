-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "job_seeker_onboarding" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "currentStepKey" TEXT NOT NULL DEFAULT 'identity',
    "status" "OnboardingStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "draftData" JSONB,
    "identityData" JSONB,
    "experienceData" JSONB,
    "qualificationData" JSONB,
    "reviewData" JSONB,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_seeker_onboarding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "job_seeker_onboarding_userId_key" ON "job_seeker_onboarding"("userId");

-- CreateIndex
CREATE INDEX "job_seeker_onboarding_status_idx" ON "job_seeker_onboarding"("status");

-- CreateIndex
CREATE INDEX "job_seeker_onboarding_currentStep_idx" ON "job_seeker_onboarding"("currentStep");

-- AddForeignKey
ALTER TABLE "job_seeker_onboarding" ADD CONSTRAINT "job_seeker_onboarding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

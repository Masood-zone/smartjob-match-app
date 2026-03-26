-- CreateTable
CREATE TABLE "employer_onboarding" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "currentStepKey" TEXT NOT NULL DEFAULT 'welcome',
    "status" "OnboardingStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "draftData" JSONB,
    "basicInfoData" JSONB,
    "verificationData" JSONB,
    "teamSetupData" JSONB,
    "reviewData" JSONB,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employer_onboarding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employer_onboarding_userId_key" ON "employer_onboarding"("userId");

-- CreateIndex
CREATE INDEX "employer_onboarding_status_idx" ON "employer_onboarding"("status");

-- CreateIndex
CREATE INDEX "employer_onboarding_currentStep_idx" ON "employer_onboarding"("currentStep");

-- AddForeignKey
ALTER TABLE "employer_onboarding" ADD CONSTRAINT "employer_onboarding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

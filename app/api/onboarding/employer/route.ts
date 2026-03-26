import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const stepRecordFields = {
  "basic-info": "basicInfoData",
  verification: "verificationData",
  "team-setup": "teamSetupData",
  review: "reviewData",
} as const;

type OnboardingPayload = {
  email?: string;
  currentStep?: number;
  stepKey?: keyof typeof stepRecordFields;
  values?: Record<string, unknown> & {
    companyName?: string;
    companyEmail?: string;
    accepted?: boolean;
  };
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as OnboardingPayload;
    const email = body.email?.trim().toLowerCase();
    const stepKey = body.stepKey;
    const currentStep = body.currentStep;
    const values = body.values;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required to save onboarding progress." },
        { status: 400 },
      );
    }

    if (!stepKey || currentStep === undefined || !values) {
      return NextResponse.json(
        { error: "Onboarding step data is incomplete." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { error: "No user found for this email. Please sign in first." },
        { status: 404 },
      );
    }

    const onboardingData = {
      currentStep,
      currentStepKey: stepKey,
      draftData: values,
      [stepRecordFields[stepKey]]: values,
      status:
        stepKey === "review" && values.accepted ? "COMPLETED" : "IN_PROGRESS",
      completedAt:
        stepKey === "review" && values.accepted ? new Date() : undefined,
    };

    const result = await prisma.$transaction(async (tx) => {
      const onboardingTx = tx as typeof tx & {
        user: any;
        employerOnboarding: any;
        employer: any;
      };

      const onboarding = await onboardingTx.employerOnboarding.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          currentStep: onboardingData.currentStep,
          currentStepKey: onboardingData.currentStepKey,
          draftData: onboardingData.draftData,
          basicInfoData:
            stepKey === "basic-info" ? onboardingData.draftData : undefined,
          verificationData:
            stepKey === "verification" ? onboardingData.draftData : undefined,
          teamSetupData:
            stepKey === "team-setup" ? onboardingData.draftData : undefined,
          reviewData:
            stepKey === "review" ? onboardingData.draftData : undefined,
          status: onboardingData.status,
          completedAt: onboardingData.completedAt,
        },
        update: {
          currentStep: onboardingData.currentStep,
          currentStepKey: onboardingData.currentStepKey,
          draftData: onboardingData.draftData,
          basicInfoData:
            stepKey === "basic-info" ? onboardingData.draftData : undefined,
          verificationData:
            stepKey === "verification" ? onboardingData.draftData : undefined,
          teamSetupData:
            stepKey === "team-setup" ? onboardingData.draftData : undefined,
          reviewData:
            stepKey === "review" ? onboardingData.draftData : undefined,
          status: onboardingData.status,
          completedAt: onboardingData.completedAt,
        },
      });

      if (stepKey === "review" && values.accepted) {
        const companyName =
          typeof values.companyName === "string"
            ? values.companyName.trim()
            : "";

        if (companyName) {
          await onboardingTx.user.update({
            where: { id: user.id },
            data: { role: "EMPLOYER" },
          });

          await onboardingTx.employer.upsert({
            where: { userId: user.id },
            create: {
              userId: user.id,
              companyName,
              role: "EMPLOYER",
            },
            update: {
              companyName,
              role: "EMPLOYER",
            },
          });
        } else {
          await onboardingTx.user.update({
            where: { id: user.id },
            data: { role: "EMPLOYER" },
          });
        }
      }

      return onboarding;
    });

    return NextResponse.json({
      ok: true,
      onboarding: result,
      completed: stepKey === "review" && values.accepted === true,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to save onboarding data.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { OnboardingStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { notificationsService } from "@/lib/notifications";

const stepRecordFields = {
  identity: "identityData",
  experience: "experienceData",
  qualifications: "qualificationData",
  review: "reviewData",
} as const;

type OnboardingPayload = {
  email?: string;
  currentStep?: number;
  stepKey?: keyof typeof stepRecordFields;
  values?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    qualification?: string;
    skills?: string[];
    accepted?: boolean;
  } & Record<string, unknown>;
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

    const draftData = values as Prisma.InputJsonValue;

    const onboardingData = {
      currentStep,
      currentStepKey: stepKey,
      draftData,
      [stepRecordFields[stepKey]]: draftData,
      status:
        stepKey === "review" && values.accepted
          ? OnboardingStatus.COMPLETED
          : OnboardingStatus.IN_PROGRESS,
      completedAt:
        stepKey === "review" && values.accepted ? new Date() : undefined,
    };

    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const onboardingTx = tx as Prisma.TransactionClient & {
          user: Prisma.TransactionClient["user"];
          jobSeekerOnboarding: Prisma.TransactionClient["jobSeekerOnboarding"];
          jobSeeker: Prisma.TransactionClient["jobSeeker"];
        };

        const onboarding = await onboardingTx.jobSeekerOnboarding.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            currentStep: onboardingData.currentStep,
            currentStepKey: onboardingData.currentStepKey,
            draftData: onboardingData.draftData,
            identityData:
              stepKey === "identity" ? onboardingData.draftData : undefined,
            experienceData:
              stepKey === "experience" ? onboardingData.draftData : undefined,
            qualificationData:
              stepKey === "qualifications"
                ? onboardingData.draftData
                : undefined,
            reviewData:
              stepKey === "review" ? onboardingData.draftData : undefined,
            status: onboardingData.status,
            completedAt: onboardingData.completedAt,
          },
          update: {
            currentStep: onboardingData.currentStep,
            currentStepKey: onboardingData.currentStepKey,
            draftData: onboardingData.draftData,
            identityData:
              stepKey === "identity" ? onboardingData.draftData : undefined,
            experienceData:
              stepKey === "experience" ? onboardingData.draftData : undefined,
            qualificationData:
              stepKey === "qualifications"
                ? onboardingData.draftData
                : undefined,
            reviewData:
              stepKey === "review" ? onboardingData.draftData : undefined,
            status: onboardingData.status,
            completedAt: onboardingData.completedAt,
          },
        });

        if (stepKey === "review" && values.accepted) {
          const fullName = [values.firstName, values.lastName]
            .filter(Boolean)
            .join(" ")
            .trim();

          if (fullName) {
            await onboardingTx.user.update({
              where: { id: user.id },
              data: { name: fullName, role: "JOB_SEEKER" },
            });
          } else {
            await onboardingTx.user.update({
              where: { id: user.id },
              data: { role: "JOB_SEEKER" },
            });
          }

          if (values.qualification && Array.isArray(values.skills)) {
            await onboardingTx.jobSeeker.upsert({
              where: { userId: user.id },
              create: {
                userId: user.id,
                qualification: values.qualification as never,
                skills: values.skills,
              },
              update: {
                qualification: values.qualification as never,
                skills: values.skills,
              },
            });
          }
        }

        return onboarding;
      },
    );

    if (stepKey === "review" && values.accepted) {
      const fullName = [values.firstName, values.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

      try {
        await notificationsService.sendJobSeekerWelcomeEmail({
          email,
          name: fullName || undefined,
        });
      } catch (error) {
        console.error("Failed to send job seeker welcome email:", error);
      }
    }

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

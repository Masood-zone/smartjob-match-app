import { NextResponse } from "next/server";
import { OnboardingStatus, VerificationStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { notificationsService } from "@/lib/notifications";

const allowedStatuses = new Set<VerificationStatus>([
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { status?: string };

    if (!allowedStatuses.has(body.status as VerificationStatus)) {
      return NextResponse.json(
        { error: "A valid verification status is required." },
        { status: 400 },
      );
    }

    const employer = await prisma.employer.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        companyName: true,
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (!employer) {
      return NextResponse.json(
        { error: "The requested employer was not found." },
        { status: 404 },
      );
    }

    const verificationStatus = body.status as VerificationStatus;

    const onboarding = await prisma.employerOnboarding.upsert({
      where: { userId: employer.userId },
      create: {
        userId: employer.userId,
        currentStep: 0,
        currentStepKey: "verification",
        status:
          verificationStatus === "APPROVED"
            ? OnboardingStatus.COMPLETED
            : OnboardingStatus.IN_PROGRESS,
        verificationStatus,
        completedAt: verificationStatus === "APPROVED" ? new Date() : undefined,
      },
      update: {
        verificationStatus,
        status:
          verificationStatus === "APPROVED"
            ? OnboardingStatus.COMPLETED
            : OnboardingStatus.IN_PROGRESS,
        completedAt: verificationStatus === "APPROVED" ? new Date() : undefined,
      },
    });

    try {
      await notificationsService.sendEmployerDecisionEmail({
        email: employer.user.email,
        name: employer.companyName || employer.user.name,
        approved: verificationStatus === "APPROVED",
      });
    } catch (error) {
      console.error("Failed to send employer decision email:", error);
    }

    return NextResponse.json({ ok: true, onboarding });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to update the employer status.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

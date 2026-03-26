import { NextResponse } from "next/server";
import { OnboardingStatus, VerificationStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  clearMatchesForSeeker,
  rebuildMatchesForSeeker,
} from "@/lib/matching/sync";
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

    const seeker = await prisma.jobSeeker.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (!seeker) {
      return NextResponse.json(
        { error: "The requested job seeker was not found." },
        { status: 404 },
      );
    }

    const verificationStatus = body.status as VerificationStatus;

    const onboarding = await prisma.jobSeekerOnboarding.upsert({
      where: { userId: seeker.userId },
      create: {
        userId: seeker.userId,
        currentStep: 0,
        currentStepKey: "review",
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
      await notificationsService.sendJobSeekerDecisionEmail({
        email: seeker.user.email,
        name: seeker.user.name,
        approved: verificationStatus === "APPROVED",
      });
    } catch (error) {
      console.error("Failed to send job seeker decision email:", error);
    }

    if (verificationStatus === "APPROVED") {
      try {
        await rebuildMatchesForSeeker(seeker.userId);
      } catch (error) {
        console.error("Failed to rebuild matches for approved seeker:", error);
      }
    } else {
      try {
        await clearMatchesForSeeker(seeker.id);
      } catch (error) {
        console.error(
          "Failed to clear matches for non-approved seeker:",
          error,
        );
      }
    }

    return NextResponse.json({ ok: true, onboarding });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to update the seeker status.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

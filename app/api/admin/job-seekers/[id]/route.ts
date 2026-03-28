import { NextResponse } from "next/server";
import { OnboardingStatus, Prisma, VerificationStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  clearMatchesForSeeker,
  rebuildMatchesForSeeker,
} from "@/lib/matching/sync";
import { notificationsService } from "@/lib/notifications";

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

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
    const body = (await request.json()) as { status?: string; reason?: string };

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
    const rejectionReason =
      typeof body.reason === "string" ? body.reason.trim() : "";

    const existingOnboarding = await prisma.jobSeekerOnboarding.findUnique({
      where: { userId: seeker.userId },
      select: { reviewData: true },
    });

    const reviewData =
      verificationStatus === "REJECTED"
        ? {
            ...asRecord(existingOnboarding?.reviewData),
            rejectionReason:
              rejectionReason || "The reviewer requested profile updates.",
            rejectionAt: new Date().toISOString(),
          }
        : asRecord(existingOnboarding?.reviewData);
    const reviewDataJson = reviewData as Prisma.InputJsonValue;

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
        reviewData: reviewDataJson,
      },
      update: {
        verificationStatus,
        status:
          verificationStatus === "APPROVED"
            ? OnboardingStatus.COMPLETED
            : OnboardingStatus.IN_PROGRESS,
        completedAt: verificationStatus === "APPROVED" ? new Date() : undefined,
        reviewData: reviewDataJson,
      },
    });

    try {
      await notificationsService.sendJobSeekerDecisionEmail({
        email: seeker.user.email,
        name: seeker.user.name,
        approved: verificationStatus === "APPROVED",
        reason: rejectionReason,
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

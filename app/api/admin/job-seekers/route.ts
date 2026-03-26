import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

function asObject(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function joinName(firstName?: unknown, lastName?: unknown, fallback?: string) {
  return (
    [firstName, lastName]
      .filter(
        (part): part is string =>
          typeof part === "string" && part.trim().length > 0,
      )
      .join(" ")
      .trim() ||
    fallback ||
    "Unnamed seeker"
  );
}

export async function GET() {
  try {
    const seekers = await prisma.jobSeeker.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            jobSeekerOnboarding: {
              select: {
                id: true,
                currentStep: true,
                currentStepKey: true,
                status: true,
                verificationStatus: true,
                completedAt: true,
                updatedAt: true,
                identityData: true,
                experienceData: true,
                qualificationData: true,
                reviewData: true,
              },
            },
          },
        },
      },
    });

    const data = seekers.map((seeker) => {
      const onboarding = seeker.user.jobSeekerOnboarding;
      const identityData = asObject(onboarding?.identityData);
      const qualificationData = asObject(onboarding?.qualificationData);
      const reviewData = asObject(onboarding?.reviewData);
      const experienceData = onboarding?.experienceData;
      const experienceEntries = Array.isArray(experienceData)
        ? experienceData.filter(
            (entry): entry is Record<string, unknown> =>
              typeof entry === "object" && entry !== null,
          )
        : [];

      const fullName = joinName(
        identityData.firstName,
        identityData.lastName,
        seeker.user.name,
      );
      const location = [identityData.locationCity, identityData.locationRegion]
        .filter(
          (part): part is string =>
            typeof part === "string" && part.trim().length > 0,
        )
        .join(", ")
        .trim();
      const qualification =
        typeof qualificationData.qualification === "string" &&
        qualificationData.qualification.trim().length > 0
          ? qualificationData.qualification
          : seeker.qualification;
      const skills = toStringArray(identityData.skills);
      const summaryParts = [
        typeof qualificationData.institutionName === "string"
          ? qualificationData.institutionName
          : null,
        typeof qualificationData.gradeLevel === "string"
          ? qualificationData.gradeLevel
          : null,
      ].filter(Boolean);

      return {
        id: seeker.id,
        userId: seeker.userId,
        fullName,
        email: seeker.user.email,
        qualification,
        skills,
        status: onboarding?.verificationStatus ?? "PENDING",
        onboardingStatus: onboarding?.status ?? "IN_PROGRESS",
        location: location || "Unspecified",
        institutionName:
          typeof qualificationData.institutionName === "string"
            ? qualificationData.institutionName
            : "Unspecified",
        gradeLevel:
          typeof qualificationData.gradeLevel === "string"
            ? qualificationData.gradeLevel
            : "Unspecified",
        yearOfCompletion:
          typeof qualificationData.yearOfCompletion === "number"
            ? qualificationData.yearOfCompletion
            : null,
        summary:
          typeof reviewData.summary === "string"
            ? reviewData.summary
            : summaryParts.filter(Boolean).join(" · ") || "Review pending",
        experienceCount: experienceEntries.length,
        createdAt: seeker.user.createdAt.toISOString(),
        updatedAt:
          onboarding?.updatedAt?.toISOString() ??
          seeker.user.createdAt.toISOString(),
        onboarding: onboarding
          ? {
              id: onboarding.id,
              currentStep: onboarding.currentStep,
              currentStepKey: onboarding.currentStepKey,
              status: onboarding.status,
              verificationStatus: onboarding.verificationStatus,
              completedAt: onboarding.completedAt?.toISOString() ?? null,
              updatedAt: onboarding.updatedAt.toISOString(),
              identityData: asObject(onboarding.identityData),
              experienceData: Array.isArray(onboarding.experienceData)
                ? (onboarding.experienceData as Record<string, unknown>[])
                : null,
              qualificationData: asObject(onboarding.qualificationData),
              reviewData: asObject(onboarding.reviewData),
            }
          : null,
        user: {
          id: seeker.user.id,
          name: seeker.user.name,
          email: seeker.user.email,
          createdAt: seeker.user.createdAt.toISOString(),
        },
      };
    });

    return NextResponse.json({ data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load job seekers.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

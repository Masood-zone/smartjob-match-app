import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

function asObject(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function toString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : fallback;
}

function toDocuments(onboarding: {
  verificationData: unknown;
  basicInfoData: unknown;
}) {
  const verificationData = asObject(onboarding.verificationData);
  const basicInfoData = asObject(onboarding.basicInfoData);

  const businessRegistrationName = toString(
    verificationData.businessRegistrationName,
    "Business registration",
  );
  const businessRegistrationUrl = toString(
    verificationData.businessRegistrationUrl,
    "#",
  );
  const businessRegistrationPublicId = toString(
    verificationData.businessRegistrationPublicId,
    "Uploaded document",
  );

  const documents = [
    {
      label: businessRegistrationName,
      href: businessRegistrationUrl,
      meta: businessRegistrationPublicId,
    },
  ].filter(
    (document) =>
      document.href !== "#" || document.meta !== "Uploaded document",
  );

  return documents;
}

export async function GET() {
  try {
    const employers = await prisma.employer.findMany({
      orderBy: { id: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            employerOnboarding: {
              select: {
                id: true,
                currentStep: true,
                currentStepKey: true,
                status: true,
                verificationStatus: true,
                completedAt: true,
                updatedAt: true,
                draftData: true,
                basicInfoData: true,
                verificationData: true,
                teamSetupData: true,
                reviewData: true,
              },
            },
          },
        },
      },
    });

    const data = employers.map((employer) => {
      const onboarding = employer.user.employerOnboarding;
      const basicInfoData = asObject(onboarding?.basicInfoData);
      const verificationData = asObject(onboarding?.verificationData);
      const teamSetupData = asObject(onboarding?.teamSetupData);
      const reviewData = asObject(onboarding?.reviewData);

      return {
        id: employer.id,
        userId: employer.userId,
        companyName: toString(
          basicInfoData.companyName,
          employer.companyName || employer.user.name || "Unnamed company",
        ),
        companyEmail: toString(basicInfoData.companyEmail, employer.user.email),
        industry: toString(basicInfoData.industry, "Unspecified"),
        status: onboarding?.verificationStatus ?? "PENDING",
        onboardingStatus: onboarding?.status ?? "IN_PROGRESS",
        location:
          [toString(basicInfoData.city), toString(basicInfoData.country)]
            .filter(Boolean)
            .join(", ") || "Unspecified",
        employeeRange:
          typeof teamSetupData.currentTeamSize === "number"
            ? `${teamSetupData.currentTeamSize} team members`
            : "Unspecified",
        contactPerson: toString(
          basicInfoData.contactPerson,
          employer.user.name,
        ),
        summary:
          toString(basicInfoData.businessDescription) ||
          "Verification details are being reviewed.",
        documents: toDocuments({
          verificationData,
          basicInfoData,
        }),
        createdAt: employer.user.createdAt.toISOString(),
        updatedAt:
          onboarding?.updatedAt?.toISOString() ??
          employer.user.createdAt.toISOString(),
        onboarding: onboarding
          ? {
              id: onboarding.id,
              currentStep: onboarding.currentStep,
              currentStepKey: onboarding.currentStepKey,
              status: onboarding.status,
              verificationStatus: onboarding.verificationStatus,
              completedAt: onboarding.completedAt?.toISOString() ?? null,
              updatedAt: onboarding.updatedAt.toISOString(),
              basicInfoData: asObject(onboarding.basicInfoData),
              verificationData: asObject(onboarding.verificationData),
              teamSetupData: asObject(onboarding.teamSetupData),
              reviewData: asObject(onboarding.reviewData),
            }
          : null,
        user: {
          id: employer.user.id,
          name: employer.user.name,
          email: employer.user.email,
          createdAt: employer.user.createdAt.toISOString(),
        },
      };
    });

    return NextResponse.json({ data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load employers.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

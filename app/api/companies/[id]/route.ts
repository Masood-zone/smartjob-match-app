import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function toString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : fallback;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const company = await prisma.employer.findUnique({
      where: { id },
      include: {
        jobs: {
          orderBy: { createdAt: "desc" },
          include: {
            applications: {
              select: { id: true },
            },
            matches: {
              select: {
                id: true,
                score: true,
                matchType: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
            employerOnboarding: {
              select: {
                status: true,
                verificationStatus: true,
                completedAt: true,
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

    if (
      !company ||
      (company.user.employerOnboarding?.verificationStatus !== "APPROVED" &&
        company.user.employerOnboarding?.status !== "COMPLETED")
    ) {
      return NextResponse.json(
        { error: "The requested company was not found." },
        { status: 404 },
      );
    }

    const basicInfoData = asRecord(
      company.user.employerOnboarding?.basicInfoData,
    );
    const teamSetupData = asRecord(
      company.user.employerOnboarding?.teamSetupData,
    );
    const verificationData = asRecord(
      company.user.employerOnboarding?.verificationData,
    );
    const reviewData = asRecord(company.user.employerOnboarding?.reviewData);

    const data = {
      id: company.id,
      userId: company.userId,
      companyName: toString(
        basicInfoData.companyName,
        company.companyName || company.user.name || "Unnamed company",
      ),
      companyEmail: toString(basicInfoData.companyEmail, company.user.email),
      industry: toString(basicInfoData.industry, "Unspecified"),
      location:
        [toString(basicInfoData.city), toString(basicInfoData.country)]
          .filter(Boolean)
          .join(", ") || "Unspecified",
      logoUrl: company.user.image,
      website: toString(basicInfoData.website, ""),
      phoneNumber: toString(basicInfoData.phoneNumber, ""),
      address: toString(basicInfoData.address, ""),
      summary:
        toString(basicInfoData.businessDescription) ||
        toString(
          reviewData.summary,
          "Verification complete and ready for hiring.",
        ),
      employeeRange:
        typeof teamSetupData.currentTeamSize === "number"
          ? `${teamSetupData.currentTeamSize}+ team members`
          : "Unspecified",
      plannedHires:
        typeof teamSetupData.plannedHires === "number"
          ? teamSetupData.plannedHires
          : null,
      teamFocus: toString(teamSetupData.teamFocus, "Unspecified"),
      documents: [
        {
          label: toString(
            verificationData.businessRegistrationName,
            "Business registration",
          ),
          href: toString(verificationData.businessRegistrationUrl, "#"),
          meta: toString(
            verificationData.businessRegistrationPublicId,
            "Uploaded document",
          ),
        },
      ].filter(
        (document) =>
          document.href !== "#" || document.meta !== "Uploaded document",
      ),
      jobs: company.jobs.map((job) => ({
        id: job.id,
        title: job.title,
        description: job.description,
        location: job.location || "Unspecified",
        requiredQualification: job.requiredQualification,
        requiredSkills: job.requiredSkills,
        applicationsCount: job.applications.length,
        matchesCount: job.matches.length,
        topMatchScore: job.matches.reduce(
          (highest, match) => Math.max(highest, match.score),
          0,
        ),
        topMatchType:
          job.matches.sort((left, right) => right.score - left.score)[0]
            ?.matchType ?? null,
        createdAt: job.createdAt.toISOString(),
      })),
      createdAt: company.user.createdAt.toISOString(),
      updatedAt:
        company.user.employerOnboarding?.completedAt?.toISOString() ??
        company.user.createdAt.toISOString(),
    };

    return NextResponse.json({ data });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load company details.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

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

function toNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const search = searchParams.get("search")?.trim().toLowerCase() ?? "";

    const employers = await prisma.employer.findMany({
      orderBy: { id: "desc" },
      include: {
        jobs: {
          select: {
            id: true,
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
                teamSetupData: true,
                reviewData: true,
              },
            },
          },
        },
      },
    });

    const data = employers
      .filter(
        (employer) =>
          employer.user.employerOnboarding?.verificationStatus === "APPROVED" ||
          employer.user.employerOnboarding?.status === "COMPLETED",
      )
      .map((employer) => {
        const basicInfoData = asRecord(
          employer.user.employerOnboarding?.basicInfoData,
        );
        const teamSetupData = asRecord(
          employer.user.employerOnboarding?.teamSetupData,
        );
        const reviewData = asRecord(
          employer.user.employerOnboarding?.reviewData,
        );
        const companyName = toString(
          basicInfoData.companyName,
          employer.companyName || employer.user.name || "Unnamed company",
        );
        const companyEmail = toString(
          basicInfoData.companyEmail,
          employer.user.email,
        );
        const industry = toString(basicInfoData.industry, "Unspecified");
        const city = toString(basicInfoData.city);
        const country = toString(basicInfoData.country);
        const location =
          [city, country].filter(Boolean).join(", ") || "Unspecified";
        const summary =
          toString(basicInfoData.businessDescription) ||
          toString(
            reviewData.summary,
            "Verification complete and ready for hiring.",
          );

        return {
          id: employer.id,
          userId: employer.userId,
          companyName,
          companyEmail,
          industry,
          location,
          logoUrl: employer.user.image,
          employeeRange:
            typeof teamSetupData.currentTeamSize === "number"
              ? `${teamSetupData.currentTeamSize}+ team members`
              : "Unspecified",
          plannedHires:
            typeof teamSetupData.plannedHires === "number"
              ? teamSetupData.plannedHires
              : null,
          teamFocus: toString(teamSetupData.teamFocus, "Unspecified"),
          summary,
          jobsCount: employer.jobs.length,
          createdAt: employer.user.createdAt.toISOString(),
          updatedAt:
            employer.user.employerOnboarding?.completedAt?.toISOString() ??
            employer.user.createdAt.toISOString(),
        };
      })
      .filter((company) => {
        if (!search) return true;

        return [
          company.companyName,
          company.companyEmail,
          company.industry,
          company.location,
          company.summary,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search);
      });

    return NextResponse.json({ data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load companies.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

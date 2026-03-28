import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getRequestSessionUser } from "@/lib/request-session";

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

function formatCompany(employer: {
  id: string;
  companyName: string | null;
  user: {
    name: string;
    email: string;
    image: string | null;
    employerOnboarding: {
      basicInfoData: unknown;
    } | null;
  };
}) {
  const basicInfoData = asRecord(
    employer.user.employerOnboarding?.basicInfoData,
  );

  return {
    companyId: employer.id,
    companyName: toString(
      basicInfoData.companyName,
      employer.companyName || employer.user.name || "Unnamed company",
    ),
    industry: toString(basicInfoData.industry, "Unspecified"),
    location:
      [toString(basicInfoData.city), toString(basicInfoData.country)]
        .filter(Boolean)
        .join(", ") || "Unspecified",
    logoUrl: employer.user.image,
  };
}

export async function GET(request: Request) {
  try {
    const sessionUser = await getRequestSessionUser(request);

    if (!sessionUser?.id) {
      return NextResponse.json(
        { error: "You must sign in to view your dashboard." },
        { status: 401 },
      );
    }

    const seeker = await prisma.jobSeeker.findUnique({
      where: { userId: sessionUser.id },
      select: {
        id: true,
        userId: true,
        qualification: true,
        skills: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            jobSeekerOnboarding: {
              select: {
                verificationStatus: true,
                status: true,
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

    if (!seeker) {
      return NextResponse.json(
        { error: "A job seeker profile was not found for this account." },
        { status: 404 },
      );
    }

    const [
      applications,
      matches,
      decisionCount,
      interviewCount,
      totalApplications,
      totalMatches,
    ] = await Promise.all([
      prisma.application.findMany({
        where: { seekerId: seeker.id },
        orderBy: { updatedAt: "desc" },
        take: 6,
        include: {
          interview: true,
          job: {
            include: {
              employer: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      image: true,
                      employerOnboarding: {
                        select: {
                          basicInfoData: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.match.findMany({
        where: { seekerId: seeker.id },
        orderBy: { score: "desc" },
        take: 6,
        include: {
          job: {
            include: {
              employer: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      image: true,
                      employerOnboarding: {
                        select: {
                          basicInfoData: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.application.count({
        where: {
          seekerId: seeker.id,
          status: { in: ["ACCEPTED", "REJECTED"] },
        },
      }),
      prisma.interview.count({
        where: {
          application: {
            seekerId: seeker.id,
          },
        },
      }),
      prisma.application.count({
        where: { seekerId: seeker.id },
      }),
      prisma.match.count({
        where: { seekerId: seeker.id },
      }),
    ]);

    const recentApplications = applications.map((application) => {
      const company = formatCompany(application.job.employer);

      return {
        id: application.id,
        jobId: application.jobId,
        companyId: company.companyId,
        title: application.job.title,
        companyName: company.companyName,
        companyIndustry: company.industry,
        companyLocation: company.location,
        companyLogoUrl: company.logoUrl,
        status: application.status,
        requiredQualification: application.job.requiredQualification,
        requiredSkills: application.job.requiredSkills,
        location: application.job.location || "Unspecified",
        appliedAt: application.createdAt.toISOString(),
        updatedAt: application.updatedAt.toISOString(),
        interview: application.interview
          ? {
              id: application.interview.id,
              date: application.interview.date.toISOString(),
              location: application.interview.location,
              notes: application.interview.notes,
            }
          : null,
      };
    });

    const recentMatches = matches.map((match) => {
      const company = formatCompany(match.job.employer);

      return {
        id: match.id,
        jobId: match.jobId,
        companyId: company.companyId,
        title: match.job.title,
        companyName: company.companyName,
        companyIndustry: company.industry,
        companyLocation: company.location,
        companyLogoUrl: company.logoUrl,
        score: match.score,
        matchType: match.matchType,
        requiredQualification: match.job.requiredQualification,
        requiredSkills: match.job.requiredSkills,
        location: match.job.location || "Unspecified",
        matchedAt: match.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      stats: {
        totalApplications,
        matchesFound: totalMatches,
        notifications: decisionCount + interviewCount,
      },
      seeker: {
        id: seeker.id,
        userId: seeker.userId,
        fullName: seeker.user.name,
        email: seeker.user.email,
        qualification: seeker.qualification,
        skills: seeker.skills,
        onboardingStatus:
          seeker.user.jobSeekerOnboarding?.status ?? "IN_PROGRESS",
        verificationStatus:
          seeker.user.jobSeekerOnboarding?.verificationStatus ?? "PENDING",
      },
      recentApplications,
      recentMatches,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load dashboard data.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

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

function toNullableString(value: unknown) {
  const stringValue = toString(value, "");

  return stringValue.length > 0 ? stringValue : null;
}

function toDateString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function parseExperience(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => asRecord(entry))
    .map((entry) => ({
      jobTitle: toString(entry.jobTitle, "Untitled role"),
      companyName: toString(entry.companyName, "Company pending"),
      startDate: toDateString(entry.startDate),
      endDate: toDateString(entry.endDate),
      isCurrentRole: Boolean(entry.isCurrentRole),
      description: toString(entry.description, ""),
    }));
}

function formatCompany(employer: {
  id: string;
  userId: string;
  companyName: string | null;
  user: {
    name: string;
    email: string;
    image: string | null;
    employerOnboarding: {
      basicInfoData: unknown;
      teamSetupData: unknown;
      verificationStatus: string;
      status: string;
    } | null;
  };
}) {
  const basicInfoData = asRecord(
    employer.user.employerOnboarding?.basicInfoData,
  );
  const teamSetupData = asRecord(
    employer.user.employerOnboarding?.teamSetupData,
  );

  return {
    id: employer.id,
    userId: employer.userId,
    companyName: toString(
      basicInfoData.companyName,
      employer.companyName || employer.user.name || "Unnamed company",
    ),
    companyEmail: toString(basicInfoData.companyEmail, employer.user.email),
    industry: toString(basicInfoData.industry, "Unspecified"),
    location:
      [toString(basicInfoData.city), toString(basicInfoData.country)]
        .filter(Boolean)
        .join(", ") || "Unspecified",
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
    verificationStatus:
      employer.user.employerOnboarding?.verificationStatus ?? "PENDING",
    onboardingStatus: employer.user.employerOnboarding?.status ?? "IN_PROGRESS",
  };
}

export async function GET(request: Request) {
  try {
    const sessionUser = await getRequestSessionUser(request);

    if (!sessionUser?.id) {
      return NextResponse.json(
        { error: "You must sign in to view your employer dashboard." },
        { status: 401 },
      );
    }

    const employer = await prisma.employer.findUnique({
      where: { userId: sessionUser.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            employerOnboarding: {
              select: {
                status: true,
                verificationStatus: true,
                basicInfoData: true,
                teamSetupData: true,
                reviewData: true,
              },
            },
          },
        },
      },
    });

    if (!employer) {
      return NextResponse.json(
        { error: "A company profile was not found for this account." },
        { status: 404 },
      );
    }

    const reviewData = asRecord(employer.user.employerOnboarding?.reviewData);

    const [jobs, totalApplications, totalMatches, totalInterviews] =
      await Promise.all([
        prisma.job.findMany({
          where: { employerId: employer.id },
          orderBy: { createdAt: "desc" },
          include: {
            applications: {
              select: {
                id: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                seekerId: true,
              },
            },
            matches: {
              select: {
                id: true,
                score: true,
                matchType: true,
                seekerId: true,
                jobSeeker: {
                  select: {
                    id: true,
                    userId: true,
                    qualification: true,
                    skills: true,
                    user: {
                      select: {
                        name: true,
                        email: true,
                        image: true,
                        jobSeekerOnboarding: {
                          select: {
                            identityData: true,
                            experienceData: true,
                            qualificationData: true,
                            reviewData: true,
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
          where: { job: { employerId: employer.id } },
        }),
        prisma.match.count({
          where: { job: { employerId: employer.id } },
        }),
        prisma.interview.count({
          where: {
            application: {
              job: {
                employerId: employer.id,
              },
            },
          },
        }),
      ]);

    const recentApplications = jobs
      .flatMap((job) =>
        job.applications.map((application) => {
          const match = job.matches.find(
            (candidateMatch) =>
              candidateMatch.seekerId === application.seekerId,
          );

          return {
            id: application.id,
            jobId: job.id,
            title: job.title,
            location: job.location || "Unspecified",
            status: application.status,
            appliedAt: application.createdAt.toISOString(),
            updatedAt: application.updatedAt.toISOString(),
            matchScore: match?.score ?? null,
            matchType: match?.matchType ?? null,
          };
        }),
      )
      .sort(
        (left, right) =>
          new Date(right.updatedAt).getTime() -
          new Date(left.updatedAt).getTime(),
      )
      .slice(0, 8);

    const topMatches = jobs
      .flatMap((job) =>
        job.matches.map((match) => {
          const onboarding = match.jobSeeker.user.jobSeekerOnboarding;
          const identityData = asRecord(onboarding?.identityData);
          const qualificationData = asRecord(onboarding?.qualificationData);
          const reviewData = asRecord(onboarding?.reviewData);
          const experienceData = parseExperience(onboarding?.experienceData);

          const fullName =
            [toString(identityData.firstName), toString(identityData.lastName)]
              .filter(Boolean)
              .join(" ")
              .trim() ||
            match.jobSeeker.user.name ||
            "Unnamed seeker";

          return {
            id: match.id,
            jobId: job.id,
            title: job.title,
            location: job.location || "Unspecified",
            score: match.score,
            matchType: match.matchType,
            seekerId: match.seekerId,
            seeker: {
              id: match.jobSeeker.id,
              userId: match.jobSeeker.userId,
              fullName,
              email: match.jobSeeker.user.email,
              image: match.jobSeeker.user.image,
              qualification: match.jobSeeker.qualification,
              skills: match.jobSeeker.skills,
              summary:
                toString(reviewData.summary) ||
                `${toString(qualificationData.institutionName, "Institution pending")} · ${toString(qualificationData.gradeLevel, "Grade pending")}`,
              location:
                [
                  toString(identityData.locationCity),
                  toString(identityData.locationRegion),
                ]
                  .filter(Boolean)
                  .join(", ") || "Unspecified",
              experience: experienceData,
            },
          };
        }),
      )
      .sort((left, right) => right.score - left.score)
      .slice(0, 8);

    const data = {
      employer: formatCompany(employer),
      rejectionReason: toNullableString(reviewData.rejectionReason),
      stats: {
        totalJobs: jobs.length,
        totalApplications,
        totalMatches,
        totalInterviews,
      },
      jobs: jobs.map((job) => ({
        id: job.id,
        employerId: job.employerId,
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
      recentApplications,
      topMatches,
    };

    return NextResponse.json({ data });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load employer dashboard.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

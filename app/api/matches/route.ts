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

function formatSeeker(seeker: {
  id: string;
  userId: string;
  qualification: string;
  skills: string[];
  user: {
    name: string;
    email: string;
    jobSeekerOnboarding: {
      identityData: unknown;
      qualificationData: unknown;
      reviewData: unknown;
    } | null;
  };
}) {
  const identityData = asRecord(seeker.user.jobSeekerOnboarding?.identityData);
  const qualificationData = asRecord(
    seeker.user.jobSeekerOnboarding?.qualificationData,
  );
  const reviewData = asRecord(seeker.user.jobSeekerOnboarding?.reviewData);

  const fullName =
    [toString(identityData.firstName), toString(identityData.lastName)]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    seeker.user.name ||
    "Unnamed seeker";

  return {
    id: seeker.id,
    userId: seeker.userId,
    fullName,
    email: seeker.user.email,
    qualification: toString(
      qualificationData.qualification,
      seeker.qualification,
    ),
    skills: seeker.skills,
    summary:
      toString(reviewData.summary) ||
      `${toString(qualificationData.institutionName, "Institution pending")} · ${toString(qualificationData.gradeLevel, "Grade pending")}`,
  };
}

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const jobId = searchParams.get("jobId")?.trim();

    if (!jobId) {
      return NextResponse.json(
        { error: "jobId is required to load matches." },
        { status: 400 },
      );
    }

    const matches = await prisma.match.findMany({
      where: { jobId },
      orderBy: [{ score: "desc" }, { createdAt: "desc" }],
      include: {
        jobSeeker: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                jobSeekerOnboarding: {
                  select: {
                    identityData: true,
                    qualificationData: true,
                    reviewData: true,
                  },
                },
              },
            },
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            requiredQualification: true,
          },
        },
      },
    });

    const applications = await prisma.application.findMany({
      where: { jobId },
      select: {
        seekerId: true,
        status: true,
        createdAt: true,
      },
    });

    const applicationStatusMap = new Map(
      applications.map((application) => [application.seekerId, application]),
    );

    const data = matches.map((match) => {
      const seeker = formatSeeker(match.jobSeeker);
      const application = applicationStatusMap.get(match.seekerId);

      return {
        id: match.id,
        jobId: match.jobId,
        seekerId: match.seekerId,
        score: match.score,
        matchType: match.matchType,
        title: match.job.title,
        location: match.job.location || "Unspecified",
        requiredQualification: match.job.requiredQualification,
        seeker,
        applicationStatus: application?.status ?? null,
        appliedAt: application?.createdAt.toISOString() ?? null,
        createdAt: match.createdAt.toISOString(),
      };
    });

    return NextResponse.json({ data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load matches.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

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

function toDateString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function parseExperience(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((entry) => {
    const record = asRecord(entry);

    return {
      jobTitle: toString(record.jobTitle, "Untitled role"),
      companyName: toString(record.companyName, "Company pending"),
      startDate: toDateString(record.startDate),
      endDate: toDateString(record.endDate),
      isCurrentRole: Boolean(record.isCurrentRole),
      description: toString(record.description, ""),
    };
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sessionUser = await getRequestSessionUser(request);

    if (!sessionUser?.id) {
      return NextResponse.json(
        { error: "You must sign in to view applicants." },
        { status: 401 },
      );
    }

    const { id } = await params;

    const employer = await prisma.employer.findUnique({
      where: { userId: sessionUser.id },
      select: {
        id: true,
        user: {
          select: {
            employerOnboarding: {
              select: {
                verificationStatus: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!employer) {
      return NextResponse.json(
        { error: "The current account is not registered as an employer." },
        { status: 403 },
      );
    }

    const job = await prisma.job.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        employerId: true,
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "The requested job was not found." },
        { status: 404 },
      );
    }

    if (job.employerId !== employer.id) {
      return NextResponse.json(
        { error: "You can only view applicants for your own jobs." },
        { status: 403 },
      );
    }

    const [applications, matches] = await Promise.all([
      prisma.application.findMany({
        where: { jobId: job.id },
        orderBy: [{ createdAt: "desc" }],
        include: {
          jobSeeker: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                  createdAt: true,
                  jobSeekerOnboarding: {
                    select: {
                      status: true,
                      verificationStatus: true,
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
          interview: true,
        },
      }),
      prisma.match.findMany({
        where: { jobId: job.id },
        select: {
          seekerId: true,
          score: true,
          matchType: true,
        },
      }),
    ]);

    const matchMap = new Map(matches.map((match) => [match.seekerId, match]));

    const data = applications
      .map((application) => {
        const onboarding = application.jobSeeker.user.jobSeekerOnboarding;
        const identityData = asRecord(onboarding?.identityData);
        const qualificationData = asRecord(onboarding?.qualificationData);
        const reviewData = asRecord(onboarding?.reviewData);

        const fullName =
          [toString(identityData.firstName), toString(identityData.lastName)]
            .filter(Boolean)
            .join(" ")
            .trim() ||
          application.jobSeeker.user.name ||
          "Unnamed seeker";

        const match = matchMap.get(application.seekerId);

        return {
          id: application.id,
          jobId: application.jobId,
          seekerId: application.seekerId,
          status: application.status,
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
          matchScore: match?.score ?? null,
          matchType: match?.matchType ?? null,
          seeker: {
            id: application.jobSeeker.id,
            userId: application.jobSeeker.userId,
            fullName,
            email: application.jobSeeker.user.email,
            image: application.jobSeeker.user.image,
            qualification: application.jobSeeker.qualification,
            skills: application.jobSeeker.skills,
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
            profile: {
              headline: `${toString(application.jobSeeker.qualification)} candidate`,
              summary:
                toString(reviewData.summary) ||
                `${toString(qualificationData.institutionName, "Institution pending")} · ${toString(qualificationData.gradeLevel, "Grade pending")}`,
              locationMode: toString(
                identityData.locationMode,
                "SPECIFIC_LOCATION",
              ),
              locationLabel:
                [
                  toString(identityData.locationCity),
                  toString(identityData.locationRegion),
                ]
                  .filter(Boolean)
                  .join(", ") || "Unspecified",
              currentRole:
                parseExperience(onboarding?.experienceData)[0]?.jobTitle ||
                "Current or latest role",
              currentCompany:
                parseExperience(onboarding?.experienceData)[0]?.companyName ||
                "Company name",
              experience: parseExperience(onboarding?.experienceData),
              education: qualificationData.institutionName
                ? {
                    institutionName: toString(
                      qualificationData.institutionName,
                      "Institution pending",
                    ),
                    qualification: toString(
                      qualificationData.qualification,
                      application.jobSeeker.qualification,
                    ),
                    gradeLevel: toString(
                      qualificationData.gradeLevel,
                      "Grade level",
                    ),
                    yearOfCompletion: toString(
                      qualificationData.yearOfCompletion,
                      "Year of completion",
                    ),
                  }
                : null,
              notes: toString(reviewData.summary, "No notes provided yet."),
            },
          },
        };
      })
      .sort((left, right) => {
        const leftScore = left.matchScore ?? 0;
        const rightScore = right.matchScore ?? 0;

        return rightScore - leftScore;
      });

    return NextResponse.json({
      data,
      job: {
        id: job.id,
        title: job.title,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load applicants.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

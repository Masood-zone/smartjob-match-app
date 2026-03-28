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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sessionUser = await getRequestSessionUser(request);

    if (!sessionUser?.id) {
      return NextResponse.json(
        { error: "You must sign in to view an application." },
        { status: 401 },
      );
    }

    const seeker = await prisma.jobSeeker.findUnique({
      where: { userId: sessionUser.id },
      select: { id: true },
    });

    if (!seeker) {
      return NextResponse.json(
        { error: "A job seeker profile was not found for this account." },
        { status: 404 },
      );
    }

    const { id } = await params;

    const application = await prisma.application.findFirst({
      where: {
        id,
        seekerId: seeker.id,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            description: true,
            location: true,
            requiredQualification: true,
            requiredSkills: true,
            employerId: true,
          },
        },
        interview: true,
        jobSeeker: {
          include: {
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
    });

    if (!application) {
      return NextResponse.json(
        { error: "The requested application was not found." },
        { status: 404 },
      );
    }

    const onboarding = application.jobSeeker.user.jobSeekerOnboarding;
    const identityData = asRecord(onboarding?.identityData);
    const qualificationData = asRecord(onboarding?.qualificationData);
    const reviewData = asRecord(onboarding?.reviewData);
    const jobRecord = await prisma.job.findUnique({
      where: { id: application.jobId },
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        requiredQualification: true,
        requiredSkills: true,
        employerId: true,
      },
    });
    if (!jobRecord) {
      return NextResponse.json(
        { error: "The requested job was not found." },
        { status: 404 },
      );
    }
    const companyRecord = await prisma.employer.findUnique({
      where: { id: jobRecord.employerId },
      select: {
        id: true,
        companyName: true,
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });
    const company = companyRecord
      ? {
          id: companyRecord.id ?? jobRecord.employerId,
          name: toString(
            companyRecord.companyName,
            companyRecord.user?.name || "Unnamed company",
          ),
          industry: "Unspecified",
          location: "Unspecified",
          logoUrl: companyRecord.user?.image ?? null,
        }
      : {
          id: application.job.employerId,
          name: "Unnamed company",
          industry: "Unspecified",
          location: "Unspecified",
          logoUrl: null,
        };
    const match = await prisma.match.findUnique({
      where: {
        jobId_seekerId: {
          jobId: application.jobId,
          seekerId: application.seekerId,
        },
      },
      select: {
        score: true,
        matchType: true,
      },
    });

    const experienceData = Array.isArray(onboarding?.experienceData)
      ? onboarding.experienceData
      : [];

    const latestExperience = experienceData.find(
      (entry) => entry && typeof entry === "object" && !Array.isArray(entry),
    ) as Record<string, unknown> | undefined;

    const statusHeadline =
      application.status === "ACCEPTED" && application.interview
        ? "Interview scheduled"
        : application.status === "ACCEPTED"
          ? "Shortlisted and waiting"
          : application.status === "REJECTED"
            ? "Application closed"
            : "Awaiting review";

    const nextAction =
      application.status === "ACCEPTED" && application.interview
        ? "Prepare for the scheduled meeting and review any notes from the employer."
        : application.status === "ACCEPTED"
          ? "Follow up politely if the employer has not shared a meeting yet."
          : application.status === "REJECTED"
            ? "Use the feedback to strengthen your next application."
            : "Keep your profile current while the employer reviews the application.";

    const timeline = [
      {
        title: "Application submitted",
        description: `You applied on ${application.createdAt.toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
            year: "numeric",
          },
        )}.`,
        completed: true,
      },
      {
        title:
          application.status === "PENDING"
            ? "Under review"
            : "Employer response",
        description:
          application.status === "PENDING"
            ? "The employer has not completed their review yet."
            : application.status === "ACCEPTED"
              ? "Your application was shortlisted and moved forward."
              : "The employer decided not to proceed with this role.",
        completed: application.status !== "PENDING",
      },
      {
        title: application.interview ? "Meeting scheduled" : "Next update",
        description: application.interview
          ? `Meeting booked for ${application.interview.date.toLocaleString(
              "en-US",
              {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              },
            )}.`
          : "Watch for notes, a call request, or a meeting slot.",
        completed: Boolean(application.interview),
      },
    ];

    return NextResponse.json({
      data: {
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
        job: {
          id: jobRecord.id,
          title: jobRecord.title,
          description: jobRecord.description,
          location: jobRecord.location || "Unspecified",
          requiredQualification: jobRecord.requiredQualification,
          requiredSkills: jobRecord.requiredSkills,
          company,
        },
        seeker: {
          id: application.jobSeeker.id,
          userId: application.jobSeeker.userId,
          fullName:
            [toString(identityData.firstName), toString(identityData.lastName)]
              .filter(Boolean)
              .join(" ") || application.jobSeeker.user.name,
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
            currentRole: toString(
              latestExperience?.jobTitle,
              "Current or latest role",
            ),
            currentCompany: toString(
              latestExperience?.companyName,
              "Company name",
            ),
            experience: experienceData.map((entry) => {
              const experienceEntry = asRecord(entry);

              return {
                jobTitle: toString(experienceEntry.jobTitle, "Untitled role"),
                companyName: toString(
                  experienceEntry.companyName,
                  "Company pending",
                ),
                startDate: null,
                endDate: null,
                isCurrentRole: Boolean(experienceEntry.isCurrentRole),
                description: toString(experienceEntry.description, ""),
              };
            }),
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
        tracking: {
          statusHeadline,
          nextAction,
          timeline,
        },
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load application.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

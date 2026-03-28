import { ApplicationStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { notificationsService } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { getRequestSessionUser } from "@/lib/request-session";

const allowedStatuses = new Set<ApplicationStatus>(["ACCEPTED", "REJECTED"]);

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
        { error: "You must sign in to view an application." },
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

    if (
      !employer ||
      (employer.user.employerOnboarding?.verificationStatus !== "APPROVED" &&
        employer.user.employerOnboarding?.status !== "COMPLETED")
    ) {
      return NextResponse.json(
        { error: "Your employer profile is not authorized for this action." },
        { status: 403 },
      );
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            requiredQualification: true,
            requiredSkills: true,
            employerId: true,
            employer: {
              select: {
                companyName: true,
                user: {
                  select: {
                    name: true,
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
        interview: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "The requested application was not found." },
        { status: 404 },
      );
    }

    if (application.job.employerId !== employer.id) {
      return NextResponse.json(
        { error: "You can only view applications for your own jobs." },
        { status: 403 },
      );
    }

    const company = await prisma.employer.findUnique({
      where: { id: application.job.employerId },
      select: {
        companyName: true,
        user: {
          select: {
            name: true,
            image: true,
            employerOnboarding: {
              select: {
                basicInfoData: true,
              },
            },
          },
        },
      },
    });

    const onboarding = application.jobSeeker.user.jobSeekerOnboarding;
    const identityData = asRecord(onboarding?.identityData);
    const qualificationData = asRecord(onboarding?.qualificationData);
    const reviewData = asRecord(onboarding?.reviewData);
    const experienceData = parseExperience(onboarding?.experienceData);
    const employerBasicInfo = asRecord(
      company?.user.employerOnboarding?.basicInfoData,
    );
    const companyName = toString(
      employerBasicInfo.companyName,
      company?.companyName || company?.user.name || "Unnamed company",
    );
    const companyIndustry = toString(employerBasicInfo.industry, "Unspecified");
    const companyLocation =
      [toString(employerBasicInfo.city), toString(employerBasicInfo.country)]
        .filter(Boolean)
        .join(", ") || "Unspecified";

    const fullName =
      [toString(identityData.firstName), toString(identityData.lastName)]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      application.jobSeeker.user.name ||
      "Unnamed seeker";

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
          id: application.job.id,
          title: application.job.title,
          location: application.job.location || "Unspecified",
          requiredQualification: application.job.requiredQualification,
          requiredSkills: application.job.requiredSkills,
          company: {
            id: application.job.employerId,
            name: companyName,
            industry: companyIndustry,
            location: companyLocation,
            logoUrl: company?.user.image ?? null,
          },
        },
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
              experienceData[0]?.jobTitle || "Current or latest role",
            currentCompany: experienceData[0]?.companyName || "Company name",
            experience: experienceData,
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
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load application.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sessionUser = await getRequestSessionUser(request);

    if (!sessionUser?.id) {
      return NextResponse.json(
        { error: "You must sign in to update an application." },
        { status: 401 },
      );
    }

    const { id } = await params;
    const body = (await request.json()) as { status?: string };

    if (!allowedStatuses.has(body.status as ApplicationStatus)) {
      return NextResponse.json(
        { error: "A valid application status is required." },
        { status: 400 },
      );
    }

    const employer = await prisma.employer.findUnique({
      where: { userId: sessionUser.id },
      select: {
        id: true,
        user: {
          select: {
            id: true,
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

    if (
      !employer ||
      (employer.user.employerOnboarding?.verificationStatus !== "APPROVED" &&
        employer.user.employerOnboarding?.status !== "COMPLETED")
    ) {
      return NextResponse.json(
        { error: "Your employer profile is not authorized for this action." },
        { status: 403 },
      );
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            employerId: true,
            employer: {
              select: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
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
        jobSeeker: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
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

    if (application.job.employerId !== employer.id) {
      return NextResponse.json(
        { error: "You can only update applications for your own jobs." },
        { status: 403 },
      );
    }

    const company = await prisma.employer.findUnique({
      where: { id: application.job.employerId },
      select: {
        companyName: true,
        user: {
          select: {
            name: true,
            email: true,
            employerOnboarding: {
              select: {
                basicInfoData: true,
              },
            },
          },
        },
      },
    });

    const previousStatus = application.status;
    const updated = await prisma.application.update({
      where: { id },
      data: {
        status: body.status as ApplicationStatus,
      },
    });

    if (previousStatus !== updated.status) {
      const employerBasicInfo = asRecord(
        company?.user.employerOnboarding?.basicInfoData,
      );
      const companyName = toString(
        employerBasicInfo.companyName,
        company?.companyName || company?.user.name || "Unnamed company",
      );

      void notificationsService
        .sendJobSeekerApplicationUpdateEmail({
          email: application.jobSeeker.user.email,
          name: application.jobSeeker.user.name,
          approved: updated.status === "ACCEPTED",
          jobTitle: application.job.title,
          companyName,
          applicationId: updated.id,
        })
        .catch((error) => {
          console.error("Failed to send application update email:", error);
        });
    }

    return NextResponse.json({
      ok: true,
      data: {
        id: updated.id,
        jobId: updated.jobId,
        seekerId: updated.seekerId,
        status: updated.status,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update application.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

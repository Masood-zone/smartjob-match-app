import { QualificationLevel } from "@prisma/client";
import { NextResponse } from "next/server";

import { computeMatch } from "@/lib/matching";
import { prisma } from "@/lib/prisma";
import { notificationsService } from "@/lib/notifications";
import { getRequestSessionUser } from "@/lib/request-session";

const defaultAlgorithmConfig = {
  qualificationWeight: 25,
  skillsWeight: 25,
  experienceWeight: 25,
  preferenceWeight: 25,
  strictQualification: true,
  allowOverqualified: true,
  allowUnderqualified: false,
  minimumSkillMatchPercent: 40,
} as const;

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function toString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : fallback;
}

function toExperienceEntries(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (entry): entry is Record<string, unknown> =>
        typeof entry === "object" && entry !== null && !Array.isArray(entry),
    )
    .map((entry) => ({
      jobTitle: toString(entry.jobTitle),
      companyName: toString(entry.companyName),
      startDate:
        entry.startDate instanceof Date || typeof entry.startDate === "string"
          ? entry.startDate
          : new Date(),
      endDate:
        entry.endDate instanceof Date || typeof entry.endDate === "string"
          ? entry.endDate
          : undefined,
      description: toString(entry.description),
    }))
    .filter(
      (entry) =>
        entry.jobTitle.length > 0 ||
        entry.companyName.length > 0 ||
        entry.description.length > 0,
    );
}

function buildLocationPreference(identityData: Record<string, unknown>) {
  const locationMode = toString(identityData.locationMode);

  if (locationMode === "REMOTE") {
    return "Remote";
  }

  if (locationMode === "PART_TIME") {
    return "Part time";
  }

  const locationParts = [
    toString(identityData.locationCity),
    toString(identityData.locationRegion),
  ].filter((part) => part.length > 0);

  return locationParts.join(", ") || toString(identityData.locationPreference);
}

function buildJobSeekerProfile(seeker: {
  qualification: QualificationLevel;
  skills: string[];
  user: {
    jobSeekerOnboarding: {
      identityData: unknown;
      experienceData: unknown;
      qualificationData: unknown;
    } | null;
  };
}) {
  const onboarding = seeker.user.jobSeekerOnboarding;
  const identityData = asRecord(onboarding?.identityData);
  const qualificationData = asRecord(onboarding?.qualificationData);
  const qualificationValues = new Set(Object.values(QualificationLevel));
  const qualification = qualificationValues.has(
    qualificationData.qualification as QualificationLevel,
  )
    ? (qualificationData.qualification as QualificationLevel)
    : seeker.qualification;

  return {
    qualification,
    skills:
      asStringArray(identityData.skills).length > 0
        ? asStringArray(identityData.skills)
        : seeker.skills,
    experiences: toExperienceEntries(onboarding?.experienceData),
    locationPreference: buildLocationPreference(identityData),
  };
}

async function getAlgorithmConfig() {
  const config = await prisma.algorithmConfig.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  if (!config) {
    return defaultAlgorithmConfig;
  }

  return {
    qualificationWeight: config.qualificationWeight,
    skillsWeight: config.skillsWeight,
    experienceWeight: config.experienceWeight,
    preferenceWeight: config.preferenceWeight,
    strictQualification: config.strictQualification,
    allowOverqualified: config.allowOverqualified,
    allowUnderqualified: config.allowUnderqualified,
    minimumSkillMatchPercent: config.minimumSkillMatchPercent,
  };
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getRequestSessionUser(request);

    if (!sessionUser?.id) {
      return NextResponse.json(
        { error: "You must sign in to apply for a job." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as { jobId?: string };
    const jobId = body.jobId?.trim();

    if (!jobId) {
      return NextResponse.json(
        { error: "A jobId is required to apply." },
        { status: 400 },
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
            jobSeekerOnboarding: {
              select: {
                status: true,
                verificationStatus: true,
                identityData: true,
                experienceData: true,
                qualificationData: true,
              },
            },
          },
        },
      },
    });

    if (
      !seeker ||
      (seeker.user.jobSeekerOnboarding?.verificationStatus !== "APPROVED" &&
        seeker.user.jobSeekerOnboarding?.status !== "COMPLETED")
    ) {
      return NextResponse.json(
        {
          error:
            "Your job seeker profile must be approved before you can apply.",
        },
        { status: 403 },
      );
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
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
                    verificationStatus: true,
                    status: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (
      !job ||
      (job.employer.user.employerOnboarding?.verificationStatus !==
        "APPROVED" &&
        job.employer.user.employerOnboarding?.status !== "COMPLETED")
    ) {
      return NextResponse.json(
        { error: "The requested job could not be found." },
        { status: 404 },
      );
    }

    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_seekerId: {
          jobId,
          seekerId: seeker.id,
        },
      },
    });

    const seekerProfile = buildJobSeekerProfile(seeker);
    const algorithmConfig = await getAlgorithmConfig();
    const matchResult = computeMatch(
      seekerProfile,
      {
        title: job.title,
        description: job.description,
        requiredQualification: job.requiredQualification,
        requiredSkills: job.requiredSkills,
        location: job.location || undefined,
      },
      algorithmConfig,
    );

    const application = await prisma.$transaction(async (tx) => {
      const createdApplication = await tx.application.upsert({
        where: {
          jobId_seekerId: {
            jobId,
            seekerId: seeker.id,
          },
        },
        create: {
          jobId,
          seekerId: seeker.id,
          status: "PENDING",
        },
        update: {
          updatedAt: new Date(),
        },
      });

      await tx.match.upsert({
        where: {
          jobId_seekerId: {
            jobId,
            seekerId: seeker.id,
          },
        },
        create: {
          jobId,
          seekerId: seeker.id,
          score: matchResult.score,
          matchType: matchResult.matchType,
        },
        update: {
          score: matchResult.score,
          matchType: matchResult.matchType,
        },
      });

      return createdApplication;
    });

    if (!existingApplication) {
      const employerBasicInfo = asRecord(
        job.employer.user.employerOnboarding?.basicInfoData,
      );
      const companyName = toString(
        employerBasicInfo.companyName,
        job.employer.user.name || "Unnamed company",
      );

      void notificationsService
        .sendEmployerApplicationReceivedEmail({
          employerEmail: job.employer.user.email,
          employerName: job.employer.user.name,
          seekerName: seeker.user.name,
          jobTitle: job.title,
          companyName,
          applicationId: application.id,
          matchScore: matchResult.score,
        })
        .catch((error) => {
          console.error("Failed to send employer application email:", error);
        });
    }

    return NextResponse.json({
      data: {
        id: application.id,
        jobId: application.jobId,
        seekerId: application.seekerId,
        status: application.status,
        createdAt: application.createdAt.toISOString(),
        updatedAt: application.updatedAt.toISOString(),
      },
      created: !existingApplication,
      match: {
        score: matchResult.score,
        matchType: matchResult.matchType,
        matchedSkills: matchResult.matchedSkills,
        missingSkills: matchResult.missingSkills,
        components: matchResult.components,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to submit application.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import type { Prisma, QualificationLevel } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { computeMatch } from "./index";
import type {
  AlgorithmConfig as MatchingAlgorithmConfig,
  JobData,
  JobSeekerExperience,
  JobSeekerProfile,
} from "./utils";
import { qualificationOrder } from "./utils";

const defaultAlgorithmConfig: MatchingAlgorithmConfig = {
  qualificationWeight: 25,
  skillsWeight: 25,
  experienceWeight: 25,
  preferenceWeight: 25,
  strictQualification: true,
  allowOverqualified: true,
  allowUnderqualified: false,
  minimumSkillMatchPercent: 40,
};

type JsonRecord = Record<string, unknown>;

type SeekerMatchSource = {
  id: string;
  userId: string;
  qualification: QualificationLevel;
  skills: string[];
  user: {
    jobSeekerOnboarding: {
      identityData: Prisma.JsonValue | null;
      experienceData: Prisma.JsonValue | null;
      qualificationData: Prisma.JsonValue | null;
      verificationStatus: string;
      status: string;
    } | null;
  };
};

type JobMatchSource = {
  id: string;
  title: string;
  description: string;
  requiredQualification: QualificationLevel;
};

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toRecord(value: Prisma.JsonValue | null | undefined): JsonRecord {
  return isRecord(value) ? value : {};
}

function toStringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isQualificationLevel(value: unknown): value is QualificationLevel {
  return (
    typeof value === "string" &&
    qualificationOrder.includes(value as QualificationLevel)
  );
}

function toStringArray(value: Prisma.JsonValue | null | undefined): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function toExperienceEntries(
  value: Prisma.JsonValue | null | undefined,
): JobSeekerExperience[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map((entry) => ({
      jobTitle: toStringValue(entry.jobTitle),
      companyName: toStringValue(entry.companyName),
      startDate:
        entry.startDate instanceof Date || typeof entry.startDate === "string"
          ? entry.startDate
          : new Date(),
      endDate:
        entry.endDate instanceof Date || typeof entry.endDate === "string"
          ? entry.endDate
          : undefined,
      description: toStringValue(entry.description),
    }))
    .filter(
      (entry) =>
        entry.jobTitle.length > 0 ||
        entry.companyName.length > 0 ||
        entry.description.length > 0,
    );
}

function buildLocationPreference(identityData: JsonRecord) {
  const locationMode = toStringValue(identityData.locationMode);

  if (locationMode === "REMOTE") {
    return "Remote";
  }

  if (locationMode === "PART_TIME") {
    return "Part time";
  }

  const locationParts = [
    toStringValue(identityData.locationCity),
    toStringValue(identityData.locationRegion),
  ].filter((part) => part.length > 0);

  return (
    locationParts.join(", ") || toStringValue(identityData.locationPreference)
  );
}

async function getAlgorithmConfig(): Promise<MatchingAlgorithmConfig> {
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

function buildSeekerProfile(seeker: SeekerMatchSource): JobSeekerProfile {
  const onboarding = seeker.user.jobSeekerOnboarding;
  const identityData = toRecord(onboarding?.identityData);
  const qualificationData = toRecord(onboarding?.qualificationData);
  const qualification = isQualificationLevel(qualificationData.qualification)
    ? qualificationData.qualification
    : seeker.qualification;
  const skills = toStringArray(identityData.skills);

  return {
    qualification,
    skills: skills.length > 0 ? skills : seeker.skills,
    experiences: toExperienceEntries(onboarding?.experienceData),
    locationPreference: buildLocationPreference(identityData),
  };
}

function buildJobData(job: JobMatchSource): JobData {
  return {
    title: job.title,
    description: job.description,
    requiredQualification: job.requiredQualification,
  };
}

async function upsertMatches(
  seekerId: string,
  jobs: JobMatchSource[],
  seekerProfile: JobSeekerProfile,
  config: MatchingAlgorithmConfig,
) {
  if (!jobs.length) {
    return 0;
  }

  const operations = jobs.map((job) => {
    const result = computeMatch(seekerProfile, buildJobData(job), config);

    return prisma.match.upsert({
      where: {
        jobId_seekerId: {
          jobId: job.id,
          seekerId,
        },
      },
      create: {
        jobId: job.id,
        seekerId,
        score: result.score,
        matchType: result.matchType,
      },
      update: {
        score: result.score,
        matchType: result.matchType,
      },
    });
  });

  await prisma.$transaction(operations);

  return jobs.length;
}

export async function rebuildMatchesForSeeker(userId: string) {
  const seeker = await prisma.jobSeeker.findUnique({
    where: { userId },
    select: {
      id: true,
      userId: true,
      qualification: true,
      skills: true,
      user: {
        select: {
          jobSeekerOnboarding: {
            select: {
              identityData: true,
              experienceData: true,
              qualificationData: true,
              verificationStatus: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (!seeker || !seeker.user.jobSeekerOnboarding) {
    return { matchedJobs: 0 };
  }

  const [jobs, config] = await Promise.all([
    prisma.job.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        requiredQualification: true,
      },
    }),
    getAlgorithmConfig(),
  ]);

  const seekerProfile = buildSeekerProfile(seeker as SeekerMatchSource);
  const matchedJobs = await upsertMatches(
    seeker.id,
    jobs as JobMatchSource[],
    seekerProfile,
    config,
  );

  return { matchedJobs };
}

export async function rebuildMatchesForJob(jobId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      title: true,
      description: true,
      requiredQualification: true,
    },
  });

  if (!job) {
    return { matchedSeekers: 0 };
  }

  const [seekers, config] = await Promise.all([
    prisma.jobSeeker.findMany({
      select: {
        id: true,
        userId: true,
        qualification: true,
        skills: true,
        user: {
          select: {
            jobSeekerOnboarding: {
              select: {
                identityData: true,
                experienceData: true,
                qualificationData: true,
                verificationStatus: true,
                status: true,
              },
            },
          },
        },
      },
    }),
    getAlgorithmConfig(),
  ]);

  const activeSeekers = seekers.filter((seeker) => {
    const onboarding = seeker.user.jobSeekerOnboarding;

    return (
      onboarding?.verificationStatus === "APPROVED" ||
      onboarding?.status === "COMPLETED"
    );
  });

  const operations = activeSeekers.map((seeker) => {
    const seekerProfile = buildSeekerProfile(seeker as SeekerMatchSource);
    const result = computeMatch(seekerProfile, buildJobData(job), config);

    return prisma.match.upsert({
      where: {
        jobId_seekerId: {
          jobId: job.id,
          seekerId: seeker.id,
        },
      },
      create: {
        jobId: job.id,
        seekerId: seeker.id,
        score: result.score,
        matchType: result.matchType,
      },
      update: {
        score: result.score,
        matchType: result.matchType,
      },
    });
  });

  if (!operations.length) {
    return { matchedSeekers: 0 };
  }

  await prisma.$transaction(operations);

  return { matchedSeekers: operations.length };
}

export async function clearMatchesForSeeker(seekerId: string) {
  const { count } = await prisma.match.deleteMany({
    where: { seekerId },
  });

  return { deletedMatches: count };
}

import { QualificationLevel, VerificationStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { rebuildMatchesForJob } from "@/lib/matching/sync";
import { getRequestSessionUser } from "@/lib/request-session";

function asStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

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

function formatEmployer(employer: {
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
    companyEmail: toString(basicInfoData.companyEmail, employer.user.email),
    companyLogoUrl: employer.user.image,
    companyIndustry: toString(basicInfoData.industry, "Unspecified"),
    companyLocation:
      [toString(basicInfoData.city), toString(basicInfoData.country)]
        .filter(Boolean)
        .join(", ") || "Unspecified",
  };
}

async function getCurrentEmployer(userId: string) {
  return prisma.employer.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          employerOnboarding: {
            select: {
              verificationStatus: true,
              status: true,
              basicInfoData: true,
            },
          },
        },
      },
    },
  });
}

export async function GET(request: Request) {
  try {
    const sessionUser = await getRequestSessionUser(request);
    const searchParams = new URL(request.url).searchParams;
    const employerId = searchParams.get("employerId")?.trim() || undefined;
    const companyId = searchParams.get("companyId")?.trim() || undefined;
    const query = searchParams.get("query")?.trim().toLowerCase() || "";

    const where =
      employerId || companyId
        ? { employerId: employerId || companyId || "" }
        : {
            employer: {
              user: {
                employerOnboarding: {
                  verificationStatus: VerificationStatus.APPROVED,
                },
              },
            },
          };

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        applications: {
          select: {
            id: true,
            status: true,
          },
        },
        matches: {
          select: {
            id: true,
            score: true,
            matchType: true,
          },
        },
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
                    verificationStatus: true,
                    status: true,
                    basicInfoData: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const seeker =
      sessionUser?.role === "JOB_SEEKER"
        ? await prisma.jobSeeker.findUnique({
            where: { userId: sessionUser.id },
            select: { id: true },
          })
        : null;

    const seekerMatchMap = seeker
      ? new Map(
          (
            await prisma.match.findMany({
              where: {
                seekerId: seeker.id,
                jobId: { in: jobs.map((job) => job.id) },
              },
              select: {
                jobId: true,
                score: true,
                matchType: true,
              },
            })
          ).map((match) => [match.jobId, match]),
        )
      : null;

    const data = jobs
      .map((job) => {
        const company = formatEmployer(job.employer);
        const sortedMatches = [...job.matches].sort(
          (left, right) => right.score - left.score,
        );
        const seekerMatch = seekerMatchMap?.get(job.id);

        return {
          id: job.id,
          employerId: job.employerId,
          title: job.title,
          description: job.description,
          location: job.location || company.companyLocation,
          requiredQualification: job.requiredQualification,
          requiredSkills: job.requiredSkills,
          companyName: company.companyName,
          companyEmail: company.companyEmail,
          companyIndustry: company.companyIndustry,
          companyLocation: company.companyLocation,
          companyLogoUrl: company.companyLogoUrl,
          applicationsCount: job.applications.length,
          matchesCount: job.matches.length,
          topMatchScore: seekerMatch
            ? seekerMatch.score
            : job.matches.reduce(
                (highest, match) => Math.max(highest, match.score),
                0,
              ),
          topMatchType: seekerMatch
            ? seekerMatch.matchType
            : (sortedMatches[0]?.matchType ?? null),
          createdAt: job.createdAt.toISOString(),
        };
      })
      .filter((job) => {
        if (!query) return true;

        return [
          job.title,
          job.description,
          job.location,
          job.companyName,
          job.companyIndustry,
          job.companyLocation,
          ...(job.requiredSkills || []),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      });

    return NextResponse.json({ data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load jobs.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getRequestSessionUser(request);

    if (!sessionUser?.id) {
      return NextResponse.json(
        { error: "You must sign in to create a job." },
        { status: 401 },
      );
    }

    const employer = await getCurrentEmployer(sessionUser.id);

    if (
      !employer ||
      (employer.user.employerOnboarding?.verificationStatus !== "APPROVED" &&
        employer.user.employerOnboarding?.status !== "COMPLETED")
    ) {
      return NextResponse.json(
        {
          error: "Your employer profile must be approved before posting jobs.",
        },
        { status: 403 },
      );
    }

    const body = (await request.json()) as {
      title?: string;
      description?: string;
      requiredQualification?: string;
      requiredSkills?: unknown;
      location?: string;
    };

    const title = toString(body.title);
    const description = toString(body.description);
    const location = toString(body.location);
    const requiredSkills = asStringArray(body.requiredSkills);
    const allowedQualifications = new Set(Object.values(QualificationLevel));

    if (!title || !description || !location || requiredSkills.length === 0) {
      return NextResponse.json(
        {
          error:
            "Title, description, location, and at least one required skill are required.",
        },
        { status: 400 },
      );
    }

    if (
      !allowedQualifications.has(
        body.requiredQualification as QualificationLevel,
      )
    ) {
      return NextResponse.json(
        { error: "A valid required qualification is required." },
        { status: 400 },
      );
    }

    const job = await prisma.job.create({
      data: {
        employerId: employer.id,
        title,
        description,
        location,
        requiredQualification: body.requiredQualification as QualificationLevel,
        requiredSkills,
      },
    });

    const matchingResult = await rebuildMatchesForJob(job.id);

    return NextResponse.json({
      data: {
        id: job.id,
        employerId: job.employerId,
        title: job.title,
        description: job.description,
        location: job.location,
        requiredQualification: job.requiredQualification,
        requiredSkills: job.requiredSkills,
        createdAt: job.createdAt.toISOString(),
        matchedSeekers: matchingResult.matchedSeekers,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create job.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

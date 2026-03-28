import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

function getMonthWindows(count = 7) {
  const today = new Date();
  const windows = [] as Array<{ label: string; start: Date; end: Date }>;

  for (let index = count - 1; index >= 0; index -= 1) {
    const start = new Date(today.getFullYear(), today.getMonth() - index, 1);
    const end = new Date(today.getFullYear(), today.getMonth() - index + 1, 1);
    const label = start.toLocaleDateString("en-US", { month: "short" });

    windows.push({ label, start, end });
  }

  return windows;
}

function getTimeAgo(date: Date) {
  const elapsed = Date.now() - date.getTime();
  const minutes = Math.floor(elapsed / (60 * 1000));

  if (minutes < 60) return `${Math.max(minutes, 1)}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export async function GET() {
  try {
    const monthWindows = getMonthWindows();

    const [
      users,
      totalJobs,
      totalEmployers,
      totalMatches,
      highQualityMatches,
      jobSeekerOnboardings,
      employerOnboardings,
      recentJobs,
      recentJobSeekerReviews,
      recentEmployerReviews,
      latestMatch,
    ] = await Promise.all([
      prisma.user.findMany({
        select: { role: true, createdAt: true },
      }),
      prisma.job.count(),
      prisma.employer.count(),
      prisma.match.count(),
      prisma.match.count({ where: { score: { gte: 80 } } }),
      prisma.jobSeekerOnboarding.count({
        where: { verificationStatus: "PENDING" },
      }),
      prisma.employerOnboarding.count({
        where: { verificationStatus: "PENDING" },
      }),
      prisma.job.findMany({
        orderBy: { createdAt: "desc" },
        take: 2,
        include: {
          employer: {
            include: { user: { select: { name: true, email: true } } },
          },
        },
      }),
      prisma.jobSeekerOnboarding.findMany({
        orderBy: { updatedAt: "desc" },
        take: 2,
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.employerOnboarding.findMany({
        orderBy: { updatedAt: "desc" },
        take: 2,
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.match.findFirst({
        orderBy: { createdAt: "desc" },
        select: {
          score: true,
          matchType: true,
          createdAt: true,
          job: {
            select: {
              title: true,
              employer: {
                select: {
                  companyName: true,
                  user: { select: { name: true } },
                },
              },
            },
          },
          jobSeeker: {
            select: {
              user: { select: { name: true } },
            },
          },
        },
      }),
    ]);

    const seekersByMonth = monthWindows.map((window) => {
      return users.filter(
        (user) =>
          user.role === "JOB_SEEKER" &&
          user.createdAt >= window.start &&
          user.createdAt < window.end,
      ).length;
    });

    const employersByMonth = monthWindows.map((window) => {
      return users.filter(
        (user) =>
          user.role === "EMPLOYER" &&
          user.createdAt >= window.start &&
          user.createdAt < window.end,
      ).length;
    });

    const recentActivity = [
      ...recentJobSeekerReviews.map((review) => ({
        id: `seeker-${review.id}`,
        title: `Job seeker review ${review.verificationStatus.toLowerCase()}`,
        description: review.user.name || review.user.email,
        occurredAt: review.updatedAt.toISOString(),
        status: review.verificationStatus,
        icon:
          review.verificationStatus === "APPROVED"
            ? "verified"
            : review.verificationStatus === "REJECTED"
              ? "cancel"
              : "person_add",
        tone:
          review.verificationStatus === "APPROVED"
            ? "green"
            : review.verificationStatus === "REJECTED"
              ? "amber"
              : "primary",
      })),
      ...recentEmployerReviews.map((review) => ({
        id: `employer-${review.id}`,
        title: `Employer review ${review.verificationStatus.toLowerCase()}`,
        description: review.user.name || review.user.email,
        occurredAt: review.updatedAt.toISOString(),
        status: review.verificationStatus,
        icon:
          review.verificationStatus === "APPROVED"
            ? "verified_user"
            : review.verificationStatus === "REJECTED"
              ? "cancel"
              : "business_center",
        tone:
          review.verificationStatus === "APPROVED"
            ? "green"
            : review.verificationStatus === "REJECTED"
              ? "amber"
              : "primary",
      })),
      ...recentJobs.map((job) => ({
        id: `job-${job.id}`,
        title: `New job listing: ${job.title}`,
        description: job.employer.user.name || job.employer.user.email,
        occurredAt: job.createdAt.toISOString(),
        status: "ACTIVE",
        icon: "work",
        tone: "slate" as const,
      })),
    ]
      .sort(
        (left, right) =>
          new Date(right.occurredAt).getTime() -
          new Date(left.occurredAt).getTime(),
      )
      .slice(0, 6)
      .map((item) => ({
        ...item,
        occurredAt: getTimeAgo(new Date(item.occurredAt)),
      }));

    return NextResponse.json({
      stats: {
        totalUsers: users.length,
        pendingVerifications: jobSeekerOnboardings + employerOnboardings,
        jobsCount: totalJobs,
        activeEmployers: totalEmployers,
      },
      analytics: {
        months: monthWindows.map((window) => window.label),
        seekerSeries: seekersByMonth,
        employerSeries: employersByMonth,
        matchSuccess:
          totalMatches > 0
            ? Math.round((highQualityMatches / totalMatches) * 100)
            : 0,
      },
      recentActivity,
      realTimeMatch: latestMatch
        ? {
            score: latestMatch.score,
            matchType: latestMatch.matchType,
            jobTitle: latestMatch.job.title,
            companyName:
              latestMatch.job.employer.companyName ||
              latestMatch.job.employer.user.name ||
              "Unnamed company",
            seekerName: latestMatch.jobSeeker.user.name || "Unnamed seeker",
            updatedAt: latestMatch.createdAt.toISOString(),
          }
        : null,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load admin dashboard.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

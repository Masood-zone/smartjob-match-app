import { NextResponse } from "next/server";

import { notificationsService } from "@/lib/notifications";
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

export async function POST(request: Request) {
  try {
    const sessionUser = await getRequestSessionUser(request);

    if (!sessionUser?.id) {
      return NextResponse.json(
        { error: "You must sign in to schedule interviews." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as {
      applicationId?: string;
      date?: string;
      location?: string;
      notes?: string;
    };

    const applicationId = body.applicationId?.trim();
    const location = body.location?.trim();
    const notes = body.notes?.trim();
    const interviewDate = body.date ? new Date(body.date) : null;

    if (
      !applicationId ||
      !location ||
      !interviewDate ||
      Number.isNaN(interviewDate.getTime())
    ) {
      return NextResponse.json(
        {
          error:
            "applicationId, date, and location are required to schedule an interview.",
        },
        { status: 400 },
      );
    }

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
      where: { id: applicationId },
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
        { error: "You can only schedule interviews for your own jobs." },
        { status: 403 },
      );
    }

    const previousInterview = await prisma.interview.findUnique({
      where: { applicationId },
      select: { id: true },
    });

    const interview = await prisma.interview.upsert({
      where: { applicationId },
      create: {
        applicationId,
        date: interviewDate,
        location,
        notes: notes || null,
      },
      update: {
        date: interviewDate,
        location,
        notes: notes || null,
      },
    });

    const employerBasicInfo = asRecord(
      application.job.employer.user.employerOnboarding?.basicInfoData,
    );
    const companyName = toString(
      employerBasicInfo.companyName,
      application.job.employer.user.name || "Unnamed company",
    );

    void notificationsService
      .sendJobSeekerInterviewScheduledEmail({
        email: application.jobSeeker.user.email,
        name: application.jobSeeker.user.name,
        jobTitle: application.job.title,
        companyName,
        applicationId,
        interviewDate: interview.date.toISOString(),
        interviewLocation: interview.location,
        notes: interview.notes,
        dashboardUrl: previousInterview
          ? `${process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/onboarding/job-seeker/dashboard/applications/${applicationId}`
          : undefined,
      })
      .catch((error) => {
        console.error("Failed to send interview email:", error);
      });

    return NextResponse.json({
      ok: true,
      data: {
        id: interview.id,
        applicationId: interview.applicationId,
        date: interview.date.toISOString(),
        location: interview.location,
        notes: interview.notes,
        createdAt: interview.createdAt.toISOString(),
        updatedAt: interview.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to schedule interview.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

import { notificationsService } from "@/lib/notifications";

type NotificationRequest =
  | {
      kind?: "new-user";
      email?: string;
      name?: string;
    }
  | {
      kind: "job-seeker";
      email?: string;
      name?: string;
    }
  | {
      kind: "employer";
      email?: string;
      name?: string;
    };

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as NotificationRequest;
    const email = body.email?.trim().toLowerCase();
    const name = body.name?.trim();
    const kind = body.kind || "new-user";

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required",
          code: "EMAIL_REQUIRED",
        },
        { status: 400 },
      );
    }

    if (kind === "job-seeker") {
      await notificationsService.sendJobSeekerWelcomeEmail({ email, name });
    } else if (kind === "employer") {
      await notificationsService.sendEmployerWelcomeEmail({ email, name });
    } else {
      await notificationsService.sendNewUserWelcomeEmail({ email, name });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to send notification";

    return NextResponse.json(
      {
        success: false,
        message,
        code: "NOTIFICATION_SEND_FAILED",
      },
      { status: 500 },
    );
  }
}

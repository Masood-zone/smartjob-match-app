import { type NextRequest, NextResponse } from "next/server";
import { createElement } from "react";
import { randomBytes, randomUUID } from "node:crypto";
import { z } from "zod";

import { PasswordResetEmail } from "@/components/emails/password-reset-email";
import { emailService, getAppName, getAppUrl } from "@/lib/email-service";
import { prisma } from "@/lib/prisma";

const requestSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const parsed = requestSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "A valid email address is required" },
        { status: 400 },
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ success: true });
    }

    const identifier = `password-reset:${email}`;
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const resetUrl = `${getAppUrl()}/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(token)}`;

    await prisma.verification.deleteMany({
      where: { identifier },
    });

    await prisma.verification.create({
      data: {
        id: randomUUID(),
        identifier,
        value: token,
        expiresAt,
      },
    });

    await emailService.sendReactEmail({
      to: user.email,
      subject: `${getAppName()} password reset link`,
      component: createElement(PasswordResetEmail, {
        appName: getAppName(),
        userEmail: user.email,
        userName: user.name,
        resetUrl,
        expiresIn: "15 minutes",
      }),
    });

    return NextResponse.json({
      success: true,
      message: "Reset link sent",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to send the reset link right now",
      },
      { status: 500 },
    );
  }
}

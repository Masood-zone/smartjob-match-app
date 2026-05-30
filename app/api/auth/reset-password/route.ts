import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { hashPassword } from "better-auth/crypto";

import { prisma } from "@/lib/prisma";

const requestSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const parsed = requestSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Email, reset token, and a new password are required to continue",
        },
        { status: 400 },
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const token = parsed.data.otp.trim();
    const password = parsed.data.password;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired reset link" },
        { status: 400 },
      );
    }

    const identifier = `password-reset:${email}`;
    const verification = await prisma.verification.findFirst({
      where: {
        identifier,
        value: token,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!verification) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired reset link" },
        { status: 400 },
      );
    }

    const passwordHash = await hashPassword(password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: passwordHash },
      }),
      prisma.session.deleteMany({
        where: { userId: user.id },
      }),
      prisma.verification.delete({
        where: { id: verification.id },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to reset the password right now",
      },
      { status: 500 },
    );
  }
}

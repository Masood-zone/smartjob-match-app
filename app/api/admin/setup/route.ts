import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      name?: string;
    };

    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        {
          error: "An email address is required to create or promote an admin.",
        },
        { status: 400 },
      );
    }

    const name = body.name?.trim() || "Platform Admin";

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        role: "ADMIN",
        isActive: true,
        emailVerified: true,
      },
      create: {
        name,
        email,
        role: "ADMIN",
        isActive: true,
        emailVerified: true,
      },
    });

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to create the admin user.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

function toInteger(value: unknown) {
  const numericValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numericValue) ? Math.trunc(numericValue) : NaN;
}

function toBoolean(value: unknown, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }

  return fallback;
}

export async function GET() {
  try {
    const config = await prisma.algorithmConfig.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ data: config });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load algorithm configuration.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: string;
      qualificationWeight?: unknown;
      skillsWeight?: unknown;
      experienceWeight?: unknown;
      preferenceWeight?: unknown;
      strictQualification?: unknown;
      allowOverqualified?: unknown;
      allowUnderqualified?: unknown;
      minimumSkillMatchPercent?: unknown;
    };

    const qualificationWeight = toInteger(body.qualificationWeight);
    const skillsWeight = toInteger(body.skillsWeight);
    const experienceWeight = toInteger(body.experienceWeight);
    const preferenceWeight = toInteger(body.preferenceWeight);
    const minimumSkillMatchPercent = toInteger(body.minimumSkillMatchPercent);

    if (
      [
        qualificationWeight,
        skillsWeight,
        experienceWeight,
        preferenceWeight,
      ].some((value) => Number.isNaN(value) || value < 0)
    ) {
      return NextResponse.json(
        { error: "All algorithm weights must be valid positive numbers." },
        { status: 400 },
      );
    }

    if (
      Number.isNaN(minimumSkillMatchPercent) ||
      minimumSkillMatchPercent < 0 ||
      minimumSkillMatchPercent > 100
    ) {
      return NextResponse.json(
        {
          error: "Minimum skill match percent must be between 0 and 100.",
        },
        { status: 400 },
      );
    }

    const total =
      qualificationWeight + skillsWeight + experienceWeight + preferenceWeight;

    if (total !== 100) {
      return NextResponse.json(
        { error: "Algorithm weights must total 100% before saving." },
        { status: 400 },
      );
    }

    const strictQualification = toBoolean(body.strictQualification, true);
    const allowOverqualified = toBoolean(body.allowOverqualified, true);
    const allowUnderqualified = toBoolean(body.allowUnderqualified, false);
    const existing = body.id
      ? await prisma.algorithmConfig.findUnique({
          where: { id: body.id },
        })
      : await prisma.algorithmConfig.findFirst({
          orderBy: { updatedAt: "desc" },
        });

    const payload = {
      qualificationWeight,
      skillsWeight,
      experienceWeight,
      preferenceWeight,
      strictQualification,
      allowOverqualified,
      allowUnderqualified,
      minimumSkillMatchPercent,
    };

    const config = existing
      ? await prisma.algorithmConfig.update({
          where: { id: existing.id },
          data: payload,
        })
      : await prisma.algorithmConfig.create({
          data: payload,
        });

    return NextResponse.json({ data: config });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to save algorithm configuration.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

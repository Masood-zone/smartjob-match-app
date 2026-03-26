import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { uploadBuffer } from "@/lib/cloudinary/cloudinary-service";
import { ApiResponse } from "@/types";

const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folderRaw = formData.get("folder");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "File is required",
          code: "FILE_REQUIRED",
        } satisfies ApiResponse<never>,
        { status: 400 },
      );
    }

    if (!allowedMimeTypes.has(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Only PDF and image files are allowed",
          code: "UNSUPPORTED_FILE_TYPE",
        } satisfies ApiResponse<never>,
        { status: 400 },
      );
    }

    const folder =
      typeof folderRaw === "string" && folderRaw.trim()
        ? folderRaw.trim()
        : "onboarding/uploads";

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const resourceType = file.type.startsWith("image/") ? "image" : "auto";

    const uploaded = await uploadBuffer({
      buffer,
      folder,
      filename: file.name,
      contentType: file.type,
      resourceType,
    });

    const asset = await prisma.mediaAsset.create({
      data: {
        provider: "CLOUDINARY",
        publicId: uploaded.public_id,
        url: uploaded.url,
        secureUrl: uploaded.secure_url,
        format: uploaded.format ?? null,
        width: uploaded.width ?? null,
        height: uploaded.height ?? null,
        bytes: uploaded.bytes ?? null,
        folder,
      },
      select: {
        id: true,
        url: true,
        secureUrl: true,
        publicId: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: asset,
      } satisfies ApiResponse<typeof asset>,
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to upload file",
        code: "UPLOAD_FAILED",
      } satisfies ApiResponse<never>,
      { status: 500 },
    );
  }
}

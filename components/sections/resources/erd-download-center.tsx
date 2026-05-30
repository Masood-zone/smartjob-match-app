"use client";

import { useState } from "react";
import { Document, ImageRun, Paragraph, Packer, TextRun } from "docx";
import { jsPDF } from "jspdf";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { Button } from "@/components/ui/button";
import { diagramSize } from "@/lib/database/erd-schema";
import { renderErdSvg } from "@/lib/database/erd-svg";

type DownloadFormat = "png" | "pdf" | "docx";

async function svgToImageData(svgMarkup: string) {
  const blob = new Blob([svgMarkup], {
    type: "image/svg+xml;charset=utf-8",
  });

  const objectUrl = URL.createObjectURL(blob);

  try {
    const image = new Image();

    const imagePromise = new Promise<HTMLImageElement>((resolve, reject) => {
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Unable to load ERD artwork."));
    });

    image.src = objectUrl;

    const loadedImage = await imagePromise;

    const canvas = document.createElement("canvas");
    canvas.width = diagramSize.width;
    canvas.height = diagramSize.height;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas support is not available in this browser.");
    }

    context.drawImage(loadedImage, 0, 0, canvas.width, canvas.height);

    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => {
        if (!result) {
          reject(new Error("PNG export failed."));
          return;
        }

        resolve(result);
      }, "image/png");
    });

    const pngArrayBuffer = await pngBlob.arrayBuffer();

    return {
      pngBlob,
      pngDataUrl: canvas.toDataURL("image/png"),
      pngArrayBuffer,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function downloadBlob(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.rel = "noreferrer";
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}

async function exportDiagram(format: DownloadFormat) {
  const svgMarkup = renderErdSvg();
  const { pngBlob, pngDataUrl, pngArrayBuffer } =
    await svgToImageData(svgMarkup);

  if (format === "png") {
    downloadBlob(pngBlob, "smart-job-matching-erd.png");
    return;
  }

  if (format === "pdf") {
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [diagramSize.width, diagramSize.height],
    });

    pdf.addImage(
      pngDataUrl,
      "PNG",
      0,
      0,
      diagramSize.width,
      diagramSize.height,
    );

    pdf.save("smart-job-matching-erd.pdf");
    return;
  }

  const scale = Math.min(1, 1020 / diagramSize.width);

  // ✅ CRITICAL FIX: ArrayBuffer → Uint8Array
  const imageBuffer = new Uint8Array(pngArrayBuffer);

  const documentFile = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "Smart Job Matching ERD",
                bold: true,
                size: 30,
              }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Prisma schema reference with models, relations, and enums.",
                italics: true,
                size: 18,
              }),
            ],
          }),

          new Paragraph({
            children: [
              new ImageRun({
                type: "png",
                data: imageBuffer,
                transformation: {
                  width: Math.round(diagramSize.width * scale),
                  height: Math.round(diagramSize.height * scale),
                },
              }),
            ],
          }),
        ],
      },
    ],
  });

  const docxBlob = await Packer.toBlob(documentFile);
  downloadBlob(docxBlob, "smart-job-matching-erd.docx");
}

type ErdDownloadCenterProps = {
  compact?: boolean;
};

export function ErdDownloadCenter({ compact = false }: ErdDownloadCenterProps) {
  const [activeFormat, setActiveFormat] = useState<DownloadFormat | null>(null);

  const downloadItems: Array<{
    format: DownloadFormat;
    label: string;
    description: string;
    icon: string;
  }> = [
    {
      format: "png",
      label: "PNG",
      description: "Fast preview image for slides and email.",
      icon: "image",
    },
    {
      format: "pdf",
      label: "PDF",
      description: "Printable handoff file for supervisors.",
      icon: "picture_as_pdf",
    },
    {
      format: "docx",
      label: "DOCX",
      description: "Editable document with the ERD embedded.",
      icon: "description",
    },
  ];

  return (
    <div
      className={
        compact
          ? "space-y-3"
          : "rounded-3xl border border-outline-variant/40 bg-surface p-6 shadow-sm"
      }
    >
      {!compact ? (
        <div className="mb-5 flex items-center gap-3 text-primary">
          <MaterialSymbol icon="download" className="text-[22px]" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em]">
              Downloads
            </p>
            <p className="text-sm text-on-surface-variant">
              Export the ERD in three supervisor-friendly formats.
            </p>
          </div>
        </div>
      ) : null}

      <div className={compact ? "grid gap-3 sm:grid-cols-3" : "grid gap-3"}>
        {downloadItems.map((item) => (
          <Button
            key={item.format}
            type="button"
            variant={compact ? "outline" : "default"}
            className={
              compact
                ? "justify-start gap-3 rounded-2xl border-outline-variant/50 bg-surface px-4 py-6 text-left"
                : "justify-start gap-3 rounded-2xl px-4 py-6 text-left"
            }
            onClick={async () => {
              setActiveFormat(item.format);

              try {
                await exportDiagram(item.format);
              } finally {
                setActiveFormat(null);
              }
            }}
          >
            <MaterialSymbol icon={item.icon} className="text-[20px]" />

            <span className="flex min-w-0 flex-1 flex-col items-start">
              <span className="text-sm font-semibold tracking-tight">
                {item.label}
              </span>

              {!compact ? (
                <span className="text-xs font-normal text-on-surface-variant">
                  {item.description}
                </span>
              ) : null}
            </span>

            {activeFormat === item.format ? (
              <span className="text-[11px] uppercase tracking-[0.24em] text-primary">
                Exporting
              </span>
            ) : null}
          </Button>
        ))}
      </div>
    </div>
  );
}

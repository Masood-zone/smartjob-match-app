"use client";

import { useState } from "react";
import { Document, ImageRun, Paragraph, Packer, TextRun } from "docx";
import { jsPDF } from "jspdf";
import NextImage from "next/image";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { Button } from "@/components/ui/button";

type DownloadFormat = "svg" | "png" | "pdf" | "docx";

const previewSize = {
  width: 1770,
  height: 1910,
};

function downloadBlob(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.rel = "noreferrer";
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}

async function loadImage(src: string) {
  const image = new Image();
  image.crossOrigin = "anonymous";

  const loaded = new Promise<HTMLImageElement>((resolve, reject) => {
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("Unable to load the system architecture preview."));
  });

  image.src = src;
  return loaded;
}

async function rasterizeSvg(src: string) {
  const image = await loadImage(src);
  const width = image.naturalWidth || previewSize.width;
  const height = image.naturalHeight || previewSize.height;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas support is not available in this browser.");
  }

  context.drawImage(image, 0, 0, width, height);

  const pngBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (!result) {
        reject(new Error("PNG export failed."));
        return;
      }

      resolve(result);
    }, "image/png");
  });

  return {
    pngBlob,
    pngDataUrl: canvas.toDataURL("image/png"),
    pngArrayBuffer: await pngBlob.arrayBuffer(),
    width,
    height,
  };
}

async function exportPreview(format: DownloadFormat) {
  const source = "/system-architecture.svg";

  if (format === "svg") {
    const response = await fetch(source);
    const svgText = await response.text();
    downloadBlob(
      new Blob([svgText], { type: "image/svg+xml;charset=utf-8" }),
      "system-architecture.svg",
    );
    return;
  }

  const rasterized = await rasterizeSvg(source);

  if (format === "png") {
    downloadBlob(rasterized.pngBlob, "system-architecture.png");
    return;
  }

  if (format === "pdf") {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [rasterized.width, rasterized.height],
    });

    pdf.addImage(
      rasterized.pngDataUrl,
      "PNG",
      0,
      0,
      rasterized.width,
      rasterized.height,
    );
    pdf.save("system-architecture.pdf");
    return;
  }

  const scale = Math.min(1, 1020 / rasterized.width);
  const documentFile = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "System Architecture",
                bold: true,
                size: 30,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Architecture preview exported from the shared SVG asset.",
                italics: true,
                size: 18,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new ImageRun({
                type: "png",
                data: rasterized.pngArrayBuffer,
                transformation: {
                  width: Math.round(rasterized.width * scale),
                  height: Math.round(rasterized.height * scale),
                },
              }),
            ],
          }),
        ],
      },
    ],
  });

  const docxBlob = await Packer.toBlob(documentFile);
  downloadBlob(docxBlob, "system-architecture.docx");
}

type SystemArchitecturePreviewProps = {
  compact?: boolean;
};

export function SystemArchitecturePreview({
  compact = false,
}: SystemArchitecturePreviewProps) {
  const [activeFormat, setActiveFormat] = useState<DownloadFormat | null>(null);

  const downloadItems: Array<{
    format: DownloadFormat;
    label: string;
    description: string;
    icon: string;
  }> = [
    {
      format: "svg",
      label: "SVG",
      description: "Original vector asset from docs.",
      icon: "draw",
    },
    {
      format: "png",
      label: "PNG",
      description: "Raster preview for slides and notes.",
      icon: "image",
    },
    {
      format: "pdf",
      label: "PDF",
      description: "Printable version for review packs.",
      icon: "picture_as_pdf",
    },
    {
      format: "docx",
      label: "DOCX",
      description: "Editable handoff document.",
      icon: "description",
    },
  ];

  return (
    <div
      className={
        compact
          ? "space-y-4"
          : "rounded-3xl border border-outline-variant/40 bg-surface p-6 shadow-sm"
      }
    >
      {!compact ? (
        <div className="mb-5 flex items-center gap-3 text-primary">
          <MaterialSymbol icon="architecture" className="text-[22px]" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em]">
              System architecture
            </p>
            <p className="text-sm text-on-surface-variant">
              Preview the provided SVG and export it in multiple formats.
            </p>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[1.75rem] border border-outline-variant/40 bg-[#fcf8f2]">
        <NextImage
          src="/system-architecture.svg"
          alt="System architecture diagram preview"
          width={1770}
          height={1910}
          unoptimized
          className="h-auto w-full"
        />
      </div>

      <div className={compact ? "grid gap-3 sm:grid-cols-2" : "grid gap-3"}>
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
                await exportPreview(item.format);
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

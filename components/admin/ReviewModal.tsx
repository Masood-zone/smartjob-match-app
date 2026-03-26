"use client";

import type { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { cn } from "@/lib/utils";

import { StatusBadge } from "./StatusBadge";

interface ReviewDetailItem {
  label: string;
  value: ReactNode;
}

interface ReviewDocumentItem {
  label: string;
  href?: string;
  meta?: string;
}

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  status: string;
  initials?: string;
  avatarUrl?: string;
  summary?: string;
  details: ReviewDetailItem[];
  documents?: ReviewDocumentItem[];
}

export function ReviewModal({
  open,
  onOpenChange,
  title,
  subtitle,
  status,
  initials,
  avatarUrl,
  summary,
  details,
  documents,
}: ReviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl gap-0 p-0">
        <div className="max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-border/70 bg-surface-container-low/40 p-6 text-left sm:text-left">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-[#f4e8dd] text-lg font-bold text-[#c2652a]">
                  {avatarUrl ? (
                    <img
                      alt={title}
                      className="h-full w-full object-cover"
                      src={avatarUrl}
                    />
                  ) : (
                    (initials ?? (
                      <MaterialSymbol icon="person" className="text-2xl" />
                    ))
                  )}
                </div>

                <div>
                  <DialogTitle className="text-2xl">{title}</DialogTitle>
                  {subtitle ? (
                    <DialogDescription className="mt-1 text-sm">
                      {subtitle}
                    </DialogDescription>
                  ) : null}
                </div>
              </div>

              <StatusBadge status={status} />
            </div>
          </DialogHeader>

          <div className="space-y-6 p-6">
            {summary ? (
              <section className="rounded-2xl border border-border/70 bg-background/90 p-4 text-sm text-on-surface-variant">
                {summary}
              </section>
            ) : null}

            <section>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
                <MaterialSymbol icon="badge" className="text-sm" />
                <span>Review details</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {details.map((detail) => (
                  <div
                    key={detail.label}
                    className="rounded-2xl border border-border/70 bg-background/90 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.18em] text-on-surface-variant">
                      {detail.label}
                    </p>
                    <div className="mt-2 text-sm text-on-surface">
                      {detail.value}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {documents?.length ? (
              <section>
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
                  <MaterialSymbol icon="description" className="text-sm" />
                  <span>Documents</span>
                </div>
                <div className="space-y-3">
                  {documents.map((document) => (
                    <a
                      key={document.label}
                      className={cn(
                        "flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-background/90 p-4 transition-colors hover:border-[#c2652a] hover:bg-[#faf5ee]",
                        !document.href && "pointer-events-none opacity-80",
                      )}
                      href={document.href ?? "#"}
                    >
                      <div>
                        <p className="text-sm font-semibold text-on-surface">
                          {document.label}
                        </p>
                        {document.meta ? (
                          <p className="mt-1 text-xs text-on-surface-variant">
                            {document.meta}
                          </p>
                        ) : null}
                      </div>
                      <MaterialSymbol
                        icon="open_in_new"
                        className="text-lg text-on-surface-variant"
                      />
                    </a>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <DialogFooter className="border-t border-border/70 bg-surface-container-low/40 p-6">
            <button
              className="inline-flex items-center justify-center rounded-xl border border-border/70 px-4 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:border-[#c2652a] hover:text-[#c2652a]"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              Close
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

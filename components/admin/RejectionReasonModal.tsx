"use client";

import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RejectionReasonModalProps {
  open: boolean;
  title: string;
  description: string;
  submitLabel: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: string) => void;
}

export function RejectionReasonModal({
  open,
  title,
  description,
  submitLabel,
  onOpenChange,
  onSubmit,
}: RejectionReasonModalProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) {
      setReason("");
    }
  }, [open]);

  const trimmedReason = reason.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-0 p-0">
        <div className="p-6 sm:p-8">
          <DialogHeader className="text-left sm:text-left">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="mt-2 leading-7">
              {description}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-3">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant">
                Rejection reason
              </span>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Explain why this profile needs changes..."
                className="min-h-36 w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/70 focus:border-[#c2652a]"
              />
            </label>
          </div>

          <DialogFooter className="mt-6 gap-3 border-t border-border/70 pt-5">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex items-center justify-center rounded-xl border border-border/70 px-4 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:border-[#c2652a] hover:text-[#c2652a]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSubmit(trimmedReason)}
              disabled={!trimmedReason}
              className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
            >
              {submitLabel}
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

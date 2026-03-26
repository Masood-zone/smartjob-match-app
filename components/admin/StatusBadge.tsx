"use client";

import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-rose-100 text-rose-800 border-rose-200",
  verified: "bg-emerald-100 text-emerald-800 border-emerald-200",
  active: "bg-sky-100 text-sky-800 border-sky-200",
  review: "bg-stone-100 text-stone-700 border-stone-200",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toLowerCase();
  const style =
    statusStyles[normalized] ?? "bg-stone-100 text-stone-700 border-stone-200";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
        style,
        className,
      )}
    >
      {status}
    </span>
  );
}

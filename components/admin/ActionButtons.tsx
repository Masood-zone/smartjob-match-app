"use client";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";

interface ActionButtonsProps {
  onApprove?: () => void;
  onReject?: () => void;
  onView?: () => void;
  approveLabel?: string;
  rejectLabel?: string;
  viewLabel?: string;
}

export function ActionButtons({
  onApprove,
  onReject,
  onView,
  approveLabel = "Approve",
  rejectLabel = "Reject",
  viewLabel = "View",
}: ActionButtonsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {onView ? (
        <button
          className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background px-3 py-2 text-xs font-semibold text-on-surface-variant transition-colors hover:border-[#c2652a] hover:text-[#c2652a]"
          onClick={onView}
          type="button"
        >
          <MaterialSymbol icon="visibility" className="text-sm" />
          {viewLabel}
        </button>
      ) : null}
      {onReject ? (
        <button
          className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100"
          onClick={onReject}
          type="button"
        >
          <MaterialSymbol icon="cancel" className="text-sm" />
          {rejectLabel}
        </button>
      ) : null}
      {onApprove ? (
        <button
          className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
          onClick={onApprove}
          type="button"
        >
          <MaterialSymbol icon="check_circle" className="text-sm" />
          {approveLabel}
        </button>
      ) : null}
    </div>
  );
}

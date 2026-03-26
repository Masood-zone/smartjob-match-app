"use client";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import type { AdminRecentActivity } from "@/services/admin/types";
import { cn, timeAgo } from "@/lib/utils";

interface RecentActivityProps {
  items: AdminRecentActivity[];
}

const toneStyles = {
  primary: "bg-[#c2652a]/10 text-[#c2652a]",
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  slate: "bg-stone-100 text-stone-700",
} as const;

export function RecentActivity({ items }: RecentActivityProps) {
  return (
    <section className="rounded-3xl border border-border/70 bg-surface p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl text-on-surface">Recent Activity</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Live operational events and review queue updates.
          </p>
        </div>
        <button className="text-sm font-semibold text-[#c2652a] transition-colors hover:text-[#a44d1a]">
          View all
        </button>
      </div>

      <div className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/70 bg-background/70">
        {items.map((item) => (
          <article key={item.id} className="flex items-start gap-4 p-4">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
                toneStyles[item.tone],
              )}
            >
              <MaterialSymbol icon={item.icon} className="text-lg" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-on-surface">
                  {item.title}
                </h3>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
                  {timeAgo(item.occurredAt)}
                </span>
              </div>
              <p className="mt-1 text-sm text-on-surface-variant">
                {item.description}
              </p>
              <div className="mt-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                  {item.status}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

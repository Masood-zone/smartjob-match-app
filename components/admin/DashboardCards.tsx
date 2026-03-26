"use client";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { cn, formatCompactNumber } from "@/lib/utils";

import type { AdminDashboardStats } from "@/services/admin/types";

interface DashboardCardsProps {
  stats: AdminDashboardStats;
}

const cards = [
  {
    key: "totalUsers",
    label: "Total Users",
    helper: "Across all active roles",
    icon: "groups",
    tone: "primary",
  },
  {
    key: "pendingVerifications",
    label: "Pending Verifications",
    helper: "Needs admin review",
    icon: "fact_check",
    tone: "amber",
  },
  {
    key: "jobsCount",
    label: "Jobs Posted",
    helper: "Live opportunities",
    icon: "work",
    tone: "green",
  },
  {
    key: "activeEmployers",
    label: "Active Employers",
    helper: "Registered companies",
    icon: "business_center",
    tone: "slate",
  },
] as const;

const toneStyles = {
  primary: "bg-[#c2652a]/10 text-[#c2652a]",
  amber: "bg-amber-100 text-amber-800",
  green: "bg-emerald-100 text-emerald-800",
  slate: "bg-stone-100 text-stone-700",
} as const;

export function DashboardCards({ stats }: DashboardCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const value = formatCompactNumber(stats[card.key]);

        return (
          <article
            key={card.key}
            className="rounded-3xl border border-border/70 bg-surface p-5 shadow-sm transition-transform hover:-translate-y-0.5"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-2xl",
                  toneStyles[card.tone],
                )}
              >
                <MaterialSymbol icon={card.icon} className="text-xl" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                Live
              </span>
            </div>
            <p className="text-sm text-on-surface-variant">{card.label}</p>
            <div className="mt-2 text-3xl text-on-surface">{value}</div>
            <p className="mt-2 text-xs text-on-surface-variant">
              {card.helper}
            </p>
          </article>
        );
      })}
    </div>
  );
}

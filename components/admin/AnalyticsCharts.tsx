"use client";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import type { AdminDashboardAnalytics } from "@/services/admin/types";

interface AnalyticsChartsProps {
  data: AdminDashboardAnalytics;
}

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const maxValue = Math.max(...data.seekerSeries, ...data.employerSeries, 1);

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <section className="xl:col-span-2 rounded-3xl border border-border/70 bg-surface p-6 shadow-sm">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl text-on-surface">
              User Growth &amp; Engagement
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Candidate and employer activity over the last seven months.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#c2652a]" />
              Seekers
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-stone-500" />
              Employers
            </span>
          </div>
        </div>

        <div className="grid h-72 grid-cols-7 items-end gap-3">
          {data.months.map((month, index) => {
            const seekerHeight = (data.seekerSeries[index] / maxValue) * 100;
            const employerHeight =
              (data.employerSeries[index] / maxValue) * 100;

            return (
              <div
                key={month}
                className="flex h-full flex-col justify-end gap-2"
              >
                <div className="flex items-end gap-1.5">
                  <div
                    className="flex-1 rounded-t-2xl bg-[#f0d7c2] transition-all hover:bg-[#e8b88b]"
                    style={{ height: `${Math.max(seekerHeight, 18)}%` }}
                  />
                  <div
                    className="flex-1 rounded-t-2xl bg-[#c2652a] transition-all hover:bg-[#af571f]"
                    style={{ height: `${Math.max(employerHeight, 12)}%` }}
                  />
                </div>
                <span className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
                  {month}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-border/70 bg-surface p-6 shadow-sm">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl text-on-surface">Match Success</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Current filter settings and scoring balance.
            </p>
          </div>
          <MaterialSymbol icon="target" className="text-xl text-[#c2652a]" />
        </div>

        <div className="relative mx-auto mb-6 flex h-48 w-48 items-center justify-center rounded-full bg-[radial-gradient(circle_at_center,_rgba(194,101,42,0.08),_transparent_65%)]">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
            <circle
              className="text-border/70"
              cx="60"
              cy="60"
              fill="transparent"
              r="46"
              stroke="currentColor"
              strokeWidth="10"
            />
            <circle
              className="text-[#c2652a]"
              cx="60"
              cy="60"
              fill="transparent"
              r="46"
              stroke="currentColor"
              strokeDasharray="289"
              strokeDashoffset={289 - (289 * data.matchSuccess) / 100}
              strokeLinecap="round"
              strokeWidth="10"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-5xl text-on-surface">
              {data.matchSuccess}%
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-on-surface-variant">
              Verified
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-background/80 p-4 text-sm text-on-surface-variant">
          Algorithm performance has improved by 4% since the last tuning pass.
        </div>
      </section>
    </div>
  );
}

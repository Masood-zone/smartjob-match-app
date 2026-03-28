"use client";

import Link from "next/link";

import { AnalyticsCharts } from "./AnalyticsCharts";
import { DashboardCards } from "./DashboardCards";
import { RecentActivity } from "./RecentActivity";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { useAdminDashboardQuery } from "@/services/admin/dashboard";

export function DashboardView() {
  const { data, isLoading, isError, error } = useAdminDashboardQuery();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <section className="rounded-3xl border border-border/70 bg-surface p-6 shadow-sm">
          <div className="h-8 w-48 rounded-full bg-muted" />
          <div className="mt-4 h-6 w-80 rounded-full bg-muted" />
          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-28 rounded-3xl bg-muted/70" />
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (isError) {
    return (
      <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        {error instanceof Error ? error.message : "Unable to load dashboard."}
      </section>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* <section className="flex flex-col gap-4 rounded-3xl border border-border/70 bg-surface p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c2652a]">
            Admin Dashboard
          </p>
          <h1 className="text-4xl text-on-surface sm:text-5xl">
            Console Overview
          </h1>
          <p className="text-sm text-on-surface-variant sm:text-base">
            Track platform health, review queues, and matching performance from
            a single operational view.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="rounded-full border border-border/70 bg-background px-4 py-2 text-sm text-on-surface-variant">
            Last 30 days
          </div>
          <div className="rounded-full bg-[#c2652a] px-4 py-2 text-sm font-semibold text-white shadow-sm">
            Export report
          </div>
        </div>
      </section> */}

      {data.realTimeMatch ? (
        <section className="overflow-hidden rounded-3xl border border-primary/20 bg-primary/5 p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                Real-time score
              </p>
              <h2 className="text-3xl tracking-tight text-on-surface sm:text-4xl">
                Latest match signal from the live marketplace
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-on-surface-variant sm:text-base">
                {data.realTimeMatch.seekerName} matched with{" "}
                {data.realTimeMatch.companyName} for{" "}
                {data.realTimeMatch.jobTitle}. The latest score is pulled
                directly from the most recent generated match.
              </p>
            </div>

            <div className="flex items-center gap-5 rounded-[1.75rem] border border-primary/20 bg-surface p-5 shadow-sm">
              <div className="admin-match-orb relative flex h-24 w-24 items-center justify-center rounded-full">
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
                    strokeDashoffset={
                      289 - (289 * data.realTimeMatch.score) / 100
                    }
                    strokeLinecap="round"
                    strokeWidth="10"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl text-on-surface">
                    {data.realTimeMatch.score.toFixed(0)}%
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant">
                    Live score
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                  {data.realTimeMatch.matchType}
                </p>
                <p className="text-sm text-on-surface-variant">
                  Updated{" "}
                  {new Date(data.realTimeMatch.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <DashboardCards stats={data.stats} />
      <AnalyticsCharts data={data.analytics} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <RecentActivity items={data.recentActivity} />

        <aside className="rounded-3xl border border-border/70 bg-surface p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-2xl text-on-surface">Quick Actions</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Shortcuts for the highest volume admin tasks.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                label: "Review Seekers",
                description: "Open verification queue",
                icon: "person_search",
                href: "/admin/job-seekers",
              },
              {
                label: "Review Employers",
                description: "Open verification queue",
                icon: "business_center",
                href: "/admin/employers",
              },
              {
                label: "Algorithm Config",
                description: "Adjust match weights",
                icon: "settings_input_component",
                href: "/admin/algorithm",
              },
            ].map((item) => (
              <Link
                key={item.label}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-background/90 p-4 transition-colors hover:border-[#c2652a] hover:bg-[#faf5ee]"
                href={item.href}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#c2652a]/10 text-[#c2652a]">
                    <MaterialSymbol icon={item.icon} className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      {item.label}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {item.description}
                    </p>
                  </div>
                </div>
                <MaterialSymbol
                  icon="chevron_right"
                  className="text-xl text-on-surface-variant"
                />
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

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

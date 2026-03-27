"use client";

import Link from "next/link";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { EmployerPortalShell } from "@/components/sections/employer/employer-portal-shell";
import { useEmployerDashboardQuery } from "@/services/employer/dashboard";

function getPercent(part: number, total: number) {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

export function EmployerAnalyticsPage() {
  const { data, isLoading, isError, error, refetch } =
    useEmployerDashboardQuery();

  const jobs = data?.jobs ?? [];
  const recentApplications = data?.recentApplications ?? [];
  const topMatches = data?.topMatches ?? [];
  const totalApplications = data?.stats.totalApplications ?? 0;
  const totalMatches = data?.stats.totalMatches ?? 0;
  const totalInterviews = data?.stats.totalInterviews ?? 0;

  const averageMatchScore = jobs.length
    ? Math.round(
        jobs.reduce((total, job) => total + job.topMatchScore, 0) / jobs.length,
      )
    : 0;

  return (
    <EmployerPortalShell
      activeSection="analytics"
      actionHref="/onboarding/employer/jobs/new"
      actionLabel="Post a Job"
    >
      <div className="bg-[radial-gradient(circle_at_top_right,rgba(240,168,120,0.12),transparent_30%),linear-gradient(180deg,#faf5ee_0%,#f8f1e7_100%)] text-on-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">
                Analytics
              </p>
              <h1 className="text-4xl tracking-tight text-on-surface sm:text-5xl">
                Hiring performance and match quality
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-on-surface-variant sm:text-base">
                Monitor how quickly roles attract applicants, which jobs are
                producing the strongest matches, and where interviews are being
                scheduled.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/onboarding/employer/applicants"
                className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
              >
                Review applicants
              </Link>
              <Link
                href="/onboarding/employer/settings"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground"
              >
                Open settings
              </Link>
            </div>
          </header>

          {isError ? (
            <section className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-6 text-rose-700">
              <p className="font-semibold">Unable to load analytics.</p>
              <p className="mt-2 text-sm">
                {error instanceof Error ? error.message : "Please try again."}
              </p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-4 rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold"
              >
                Retry
              </button>
            </section>
          ) : null}

          <section className="grid gap-6 md:grid-cols-4">
            <StatCard
              label="Jobs"
              value={isLoading ? "—" : String(data?.stats.totalJobs ?? 0)}
              icon="work"
            />
            <StatCard
              label="Applications"
              value={isLoading ? "—" : String(totalApplications)}
              icon="description"
            />
            <StatCard
              label="Matches"
              value={isLoading ? "—" : String(totalMatches)}
              icon="auto_awesome"
            />
            <StatCard
              label="Interviews"
              value={isLoading ? "—" : String(totalInterviews)}
              icon="event"
            />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <article className="rounded-[1.75rem] border border-outline-variant bg-surface p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                    Role performance
                  </p>
                  <h2 className="mt-2 text-2xl tracking-tight text-on-surface">
                    Match score by posting
                  </h2>
                </div>
                <span className="text-xs uppercase tracking-[0.24em] text-on-surface-variant">
                  Average {averageMatchScore}%
                </span>
              </div>

              <div className="mt-6 space-y-4">
                {isLoading
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={`role-skeleton-${index}`}
                        className="h-20 animate-pulse rounded-[1.25rem] border border-outline-variant bg-surface-container-low"
                      />
                    ))
                  : jobs.map((job) => (
                      <article
                        key={job.id}
                        className="rounded-[1.35rem] border border-outline-variant bg-surface-container-lowest p-5"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-on-surface">
                              {job.title}
                            </h3>
                            <p className="text-sm text-on-surface-variant">
                              {job.location} · {job.requiredQualification}
                            </p>
                          </div>
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
                            {job.topMatchScore.toFixed(0)}%
                          </span>
                        </div>

                        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                          <div>
                            <div className="h-2 overflow-hidden rounded-full bg-surface-container-highest">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{
                                  width: `${Math.min(100, job.topMatchScore)}%`,
                                }}
                              />
                            </div>
                            <p className="mt-2 text-xs uppercase tracking-[0.24em] text-on-surface-variant">
                              {job.applicationsCount} applicants ·{" "}
                              {job.matchesCount} matches
                            </p>
                          </div>
                          <Link
                            href={`/onboarding/employer/applicants?jobId=${job.id}`}
                            className="inline-flex items-center gap-2 rounded-full border border-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary"
                          >
                            View applicants
                          </Link>
                        </div>
                      </article>
                    ))}
              </div>
            </article>

            <div className="space-y-6">
              <article className="rounded-[1.75rem] border border-outline-variant bg-surface-container-low p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
                <div className="flex items-center gap-3">
                  <MaterialSymbol
                    icon="analytics"
                    className="text-[20px] text-primary"
                  />
                  <h2 className="text-2xl tracking-tight text-on-surface">
                    Pipeline snapshot
                  </h2>
                </div>
                <div className="mt-6 space-y-5">
                  <Metric
                    label="Application to match"
                    value={`${getPercent(totalMatches, totalApplications)}%`}
                  />
                  <Metric
                    label="Interview rate"
                    value={`${getPercent(totalInterviews, totalApplications)}%`}
                  />
                  <Metric
                    label="Top match score"
                    value={`${averageMatchScore}%`}
                  />
                </div>
              </article>

              <article className="rounded-[1.75rem] border border-outline-variant bg-surface p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                      Top matches
                    </p>
                    <h2 className="mt-2 text-2xl tracking-tight text-on-surface">
                      Highest scoring candidates
                    </h2>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {isLoading
                    ? Array.from({ length: 3 }).map((_, index) => (
                        <div
                          key={`match-skeleton-${index}`}
                          className="h-20 animate-pulse rounded-[1.25rem] border border-outline-variant bg-surface-container-low"
                        />
                      ))
                    : topMatches.map((match) => (
                        <div
                          key={match.id}
                          className="rounded-[1.25rem] border border-outline-variant bg-surface-container-lowest p-4"
                        >
                          <p className="text-sm font-semibold text-on-surface">
                            {match.seeker.fullName}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            {match.title} · {match.location}
                          </p>
                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-container-highest">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${match.score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                </div>
              </article>

              <article className="rounded-[1.75rem] border border-outline-variant bg-surface-container-low p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                  Recent activity
                </p>
                <div className="mt-5 space-y-3">
                  {recentApplications.slice(0, 4).map((application) => (
                    <div
                      key={application.id}
                      className="rounded-[1.25rem] border border-outline-variant bg-surface p-4"
                    >
                      <p className="text-sm font-semibold text-on-surface">
                        {application.title}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {application.status} · {application.location}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </section>
        </div>
      </div>
    </EmployerPortalShell>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <article className="rounded-[1.5rem] border border-outline-variant bg-surface p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-on-surface-variant">
            {label}
          </p>
          <h3 className="mt-2 text-4xl tracking-tight text-on-surface">
            {value}
          </h3>
        </div>
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <MaterialSymbol icon={icon} className="text-[20px]" />
        </span>
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-outline-variant bg-surface px-4 py-4">
      <span className="text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant">
        {label}
      </span>
      <span className="text-lg font-semibold text-on-surface">{value}</span>
    </div>
  );
}

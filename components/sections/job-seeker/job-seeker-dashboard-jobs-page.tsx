"use client";

import Image from "next/image";
import Link from "next/link";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { useApplyToJobMutation } from "@/services/applications";
import { useJobSeekerDashboardQuery } from "@/services/job-seeker/dashboard";

import {
  getCompanyInitials,
  getMatchTone,
  getStatusTone,
} from "./job-seeker-portal-utils";
import { JobSeekerPortalShell } from "./job-seeker-portal-shell";

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function JobSeekerDashboardJobsPage() {
  const { data, isLoading, isError, error, refetch } =
    useJobSeekerDashboardQuery();
  const applyMutation = useApplyToJobMutation();

  const appliedByJobId = new Map(
    data?.recentApplications.map((application) => [
      application.jobId,
      application,
    ]),
  );

  return (
    <JobSeekerPortalShell
      activeSection="jobs"
      actionHref="/jobs"
      actionLabel="Browse jobs"
    >
      <div className="bg-[radial-gradient(circle_at_top_right,rgba(240,168,120,0.18),transparent_28%),linear-gradient(180deg,#faf5ee_0%,#f8f1e7_100%)] text-on-background">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <header className="rounded-[2rem] border border-outline-variant bg-surface-container-lowest/95 p-6 shadow-[0_18px_50px_rgba(58,48,42,0.08)] backdrop-blur sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">
                  Jobs and applications
                </p>
                <h1 className="text-4xl tracking-tight text-on-surface sm:text-5xl">
                  A cleaner view of jobs, applications, and what happens next
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-on-surface-variant sm:text-base">
                  This version keeps the content stacked and readable so each
                  job can be scanned quickly without a split-panel layout.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/onboarding/job-seeker/dashboard/matches"
                  className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
                >
                  View matches
                </Link>
                <Link
                  href="/onboarding/job-seeker/dashboard/analytics"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground"
                >
                  View analytics
                  <MaterialSymbol
                    icon="arrow_forward"
                    className="text-[16px]"
                  />
                </Link>
              </div>
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-3">
            <SummaryCard
              label="Recommended listings"
              value={isLoading ? "—" : String(data?.recentMatches.length ?? 0)}
              icon="work"
            />
            <SummaryCard
              label="Applications sent"
              value={
                isLoading ? "—" : String(data?.recentApplications.length ?? 0)
              }
              icon="description"
            />
            <SummaryCard
              label="Shortlisted roles"
              value={
                isLoading
                  ? "—"
                  : String(
                      data?.recentApplications.filter(
                        (application) => application.status === "ACCEPTED",
                      ).length ?? 0,
                    )
              }
              icon="bookmark"
            />
          </section>

          {isError ? (
            <section className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-6 text-rose-700">
              <p className="font-semibold">Unable to load job listings.</p>
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

          <section className="rounded-[1.75rem] border border-outline-variant bg-surface p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                  Recommended jobs
                </p>
                <h2 className="mt-2 text-2xl tracking-tight text-on-surface">
                  Jobs ranked for your profile
                </h2>
              </div>
              <span className="text-xs uppercase tracking-[0.24em] text-on-surface-variant">
                {data?.recentMatches.length ?? 0} visible
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {isLoading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={`job-skeleton-${index}`}
                      className="h-56 animate-pulse rounded-[1.5rem] border border-outline-variant bg-surface-container-low"
                    />
                  ))
                : data?.recentMatches.map((match) => {
                    const application = appliedByJobId.get(match.jobId);

                    return (
                      <article
                        key={match.id}
                        className="rounded-[1.5rem] border border-outline-variant bg-surface-container-lowest p-5 shadow-[0_2px_16px_rgba(58,48,42,0.04)]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-primary">
                              {match.companyLogoUrl ? (
                                <Image
                                  src={match.companyLogoUrl}
                                  alt={match.companyName}
                                  width={48}
                                  height={48}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-xs font-semibold">
                                  {getCompanyInitials(match.companyName)}
                                </span>
                              )}
                            </div>

                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant">
                                  {match.companyName}
                                </p>
                                <span
                                  className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] ${getMatchTone(match.matchType)}`}
                                >
                                  {match.matchType}
                                </span>
                              </div>
                              <h3 className="text-2xl tracking-tight text-on-surface">
                                {match.title}
                              </h3>
                              <p className="text-sm text-on-surface-variant">
                                {match.location} · {match.requiredQualification}
                              </p>
                            </div>
                          </div>

                          <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-primary">
                            {match.score.toFixed(0)}% match
                          </span>
                        </div>

                        <p className="mt-4 max-w-4xl text-sm leading-7 text-on-surface-variant line-clamp-3">
                          {match.companyIndustry} based opening with{" "}
                          {match.requiredSkills.length} key skill signals.
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {match.requiredSkills.slice(0, 5).map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full border border-outline-variant bg-surface px-3 py-1 text-[11px] text-on-surface-variant"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant pt-4">
                          <div className="text-sm text-on-surface-variant">
                            <p className="font-semibold text-on-surface">
                              {application
                                ? getStatusText(application.status)
                                : "Ready to apply"}
                            </p>
                            <p className="mt-1 text-xs uppercase tracking-[0.22em]">
                              {application
                                ? `Applied ${formatDate(application.appliedAt)}`
                                : "Not applied yet"}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <Link
                              href={`/companies/${match.companyId}`}
                              className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
                            >
                              Company profile
                            </Link>
                            {application ? (
                              <Link
                                href={`/onboarding/job-seeker/dashboard/applications/${application.id}`}
                                className="inline-flex items-center gap-2 rounded-full border border-outline-variant px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
                              >
                                View application
                              </Link>
                            ) : (
                              <button
                                type="button"
                                disabled={applyMutation.isPending}
                                onClick={() =>
                                  applyMutation.mutate(match.jobId)
                                }
                                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Apply now
                                <MaterialSymbol
                                  icon="send"
                                  className="text-[14px]"
                                />
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                  Submitted applications
                </p>
                <h2 className="mt-2 text-2xl tracking-tight text-on-surface">
                  Recent application activity
                </h2>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {isLoading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={`application-skeleton-${index}`}
                      className="h-32 animate-pulse rounded-[1.5rem] border border-outline-variant bg-surface"
                    />
                  ))
                : data?.recentApplications.map((application) => (
                    <article
                      key={application.id}
                      className="rounded-[1.5rem] border border-outline-variant bg-surface p-5"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-lg font-semibold text-on-surface">
                              {application.title}
                            </p>
                            <span
                              className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] ${getStatusTone(application.status)}`}
                            >
                              {application.status}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-on-surface-variant">
                            {application.companyName} · {application.location}
                          </p>
                          <p className="mt-2 text-xs uppercase tracking-[0.22em] text-on-surface-variant">
                            Applied {formatDate(application.appliedAt)}
                          </p>
                        </div>

                        <Link
                          href={`/onboarding/job-seeker/dashboard/applications/${application.id}`}
                          className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-low px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
                        >
                          Open detail
                        </Link>
                      </div>
                    </article>
                  ))}
            </div>
          </section>
        </div>
      </div>
    </JobSeekerPortalShell>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-outline-variant bg-surface p-5 shadow-[0_12px_34px_rgba(58,48,42,0.05)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
            {label}
          </p>
          <p className="mt-3 text-3xl tracking-tight text-on-surface">
            {value}
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <MaterialSymbol icon={icon} className="text-[22px]" />
        </div>
      </div>
    </div>
  );
}

function getStatusText(status: string) {
  if (status === "ACCEPTED") return "Shortlisted";
  if (status === "REJECTED") return "Closed";
  return "In review";
}

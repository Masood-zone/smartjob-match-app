"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { useApplyToJobMutation } from "@/services/applications";
import { useJobSeekerDashboardQuery } from "@/services/job-seeker/dashboard";

import {
  getCompanyInitials,
  getMatchTone,
  getStatusTone,
} from "./job-seeker-portal-utils";
import { JobSeekerPortalShell } from "./job-seeker-portal-shell";

export function JobSeekerDashboardPage() {
  const { data, isLoading, isError, error, refetch } =
    useJobSeekerDashboardQuery();
  const applyMutation = useApplyToJobMutation();

  const appliedByJobId = new Map(
    data?.recentApplications.map((application) => [
      application.jobId,
      application,
    ]),
  );

  const rejectedReason = data?.seeker.rejectionReason?.trim() || null;

  return (
    <JobSeekerPortalShell
      activeSection="dashboard"
      actionHref="/onboarding/job-seeker/dashboard/jobs"
      actionLabel="Browse jobs"
    >
      <div className="bg-[radial-gradient(circle_at_top_right,rgba(240,168,120,0.18),transparent_28%),linear-gradient(180deg,#faf5ee_0%,#f8f1e7_100%)] text-on-background">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <header className="rounded-[2rem] border border-outline-variant bg-surface-container-lowest/95 p-6 shadow-[0_18px_50px_rgba(58,48,42,0.08)] backdrop-blur sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">
                  Job seeker dashboard
                </p>
                <h1 className="text-4xl tracking-tight text-on-surface sm:text-5xl">
                  Welcome back
                  {data?.seeker.fullName ? `, ${data.seeker.fullName}` : ""}
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-on-surface-variant sm:text-base">
                  Your applications, match scores, and new notifications are all
                  pulled from live data so every change shows up without a
                  manual refresh.
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
                  href="/onboarding/job-seeker/dashboard/jobs"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground"
                >
                  View jobs
                  <MaterialSymbol
                    icon="arrow_forward"
                    className="text-[16px]"
                  />
                </Link>
              </div>
            </div>
          </header>

          {isError ? (
            <section className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-6 text-rose-700">
              <p className="font-semibold">Unable to load your dashboard.</p>
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

          <section className="grid gap-6 md:grid-cols-3">
            <StatCard
              label="Total applications"
              value={
                isLoading ? "—" : String(data?.stats.totalApplications ?? 0)
              }
              icon="description"
            />
            <StatCard
              label="Matches found"
              value={isLoading ? "—" : String(data?.stats.matchesFound ?? 0)}
              icon="auto_awesome"
            />
            <StatCard
              label="Notifications"
              value={isLoading ? "—" : String(data?.stats.notifications ?? 0)}
              icon="notifications"
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <article className="rounded-[1.75rem] border border-outline-variant bg-surface p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                    Recommended matches
                  </p>
                  <h2 className="mt-2 text-2xl tracking-tight text-on-surface">
                    Roles ranked for your profile
                  </h2>
                </div>
                <span className="text-xs uppercase tracking-[0.24em] text-on-surface-variant">
                  {data?.recentMatches.length ?? 0} visible
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {isLoading
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={`match-skeleton-${index}`}
                        className="h-72 animate-pulse rounded-[1.5rem] border border-outline-variant bg-surface-container-low"
                      />
                    ))
                  : data?.recentMatches.map((match) => {
                      const application = appliedByJobId.get(match.jobId);

                      return (
                        <article
                          key={match.id}
                          className="flex h-full flex-col rounded-[1.5rem] border border-outline-variant bg-surface-container-lowest p-5 transition-all hover:border-primary/35"
                        >
                          <div className="flex items-start justify-between gap-3">
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

                            <span
                              className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] ${getMatchTone(match.matchType)}`}
                            >
                              {match.matchType}
                            </span>
                          </div>

                          <div className="mt-5 space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant">
                              {match.companyName}
                            </p>
                            <h3 className="text-xl tracking-tight text-on-surface">
                              {match.title}
                            </h3>
                            <p className="text-sm text-on-surface-variant">
                              {match.location} · {match.requiredQualification}
                            </p>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {match.requiredSkills.slice(0, 4).map((skill) => (
                              <span
                                key={skill}
                                className="rounded-full border border-outline-variant bg-surface px-3 py-1 text-[11px] text-on-surface-variant"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>

                          <div className="mt-5 grid grid-cols-2 gap-3 rounded-[1.25rem] border border-outline-variant bg-surface p-4 text-sm text-on-surface-variant">
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                                Match score
                              </p>
                              <p className="mt-1 text-lg font-semibold text-on-surface">
                                {match.score.toFixed(0)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                                Applied
                              </p>
                              <p className="mt-1 text-lg font-semibold text-on-surface">
                                {application ? "Yes" : "No"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 flex items-center justify-between gap-3 border-t border-outline-variant pt-4">
                            <Link
                              href={`/companies/${match.companyId}`}
                              className="text-xs font-semibold uppercase tracking-[0.24em] text-primary"
                            >
                              Company details
                            </Link>
                            <button
                              type="button"
                              disabled={
                                applyMutation.isPending || Boolean(application)
                              }
                              onClick={() => applyMutation.mutate(match.jobId)}
                              className="inline-flex items-center gap-2 rounded-full border border-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:border-outline-variant disabled:text-on-surface-variant"
                            >
                              {applyMutation.isPending
                                ? "Applying..."
                                : application
                                  ? application.status
                                  : "Apply"}
                            </button>
                          </div>
                        </article>
                      );
                    })}
              </div>

              {!isLoading && (data?.recentMatches.length ?? 0) === 0 ? (
                <div className="mt-6 rounded-[1.5rem] border border-dashed border-outline-variant bg-surface p-6 text-center text-on-surface-variant">
                  No matches are available yet. Complete your profile or apply
                  to more jobs to improve the ranking.
                </div>
              ) : null}
            </article>

            <article className="rounded-[1.75rem] border border-outline-variant bg-surface p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                    Recent applications
                  </p>
                  <h2 className="mt-2 text-2xl tracking-tight text-on-surface">
                    Your latest application activity
                  </h2>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-[1.25rem] border border-outline-variant">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-low text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Job</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/60 bg-surface-container-lowest">
                    {isLoading
                      ? Array.from({ length: 4 }).map((_, index) => (
                          <tr key={`application-skeleton-${index}`}>
                            <td colSpan={2} className="px-4 py-5">
                              <div className="h-6 animate-pulse rounded bg-surface-container-low" />
                            </td>
                          </tr>
                        ))
                      : data?.recentApplications.map((application) => (
                          <tr key={application.id} className="align-top">
                            <td className="px-4 py-5">
                              <div className="space-y-1">
                                <p className="font-semibold text-on-surface">
                                  {application.title}
                                </p>
                                <p className="text-sm text-on-surface-variant">
                                  {application.companyName} ·{" "}
                                  {application.location}
                                </p>
                                <p className="text-[11px] uppercase tracking-[0.22em] text-on-surface-variant">
                                  Applied{" "}
                                  {new Date(
                                    application.appliedAt,
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-5">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] ${getStatusTone(application.status)}`}
                              >
                                {application.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        </div>
      </div>
    </JobSeekerPortalShell>
  );
}

export function JobSeekerJobsPage() {
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
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <header className="rounded-[2rem] border border-outline-variant bg-surface-container-lowest/95 p-6 shadow-[0_18px_50px_rgba(58,48,42,0.08)] backdrop-blur sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">
                  Jobs and applications
                </p>
                <h1 className="text-4xl tracking-tight text-on-surface sm:text-5xl">
                  Listings you can explore and jobs you already applied for
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-on-surface-variant sm:text-base">
                  This view combines active recommendations with your submitted
                  applications so you can move between discovery and follow-up
                  without leaving the dashboard.
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
                  href="/jobs"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground"
                >
                  Browse all jobs
                  <MaterialSymbol
                    icon="arrow_forward"
                    className="text-[16px]"
                  />
                </Link>
              </div>
            </div>
          </header>

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

          <section className="grid gap-6 md:grid-cols-3">
            <StatCard
              label="Recommended listings"
              value={isLoading ? "—" : String(data?.recentMatches.length ?? 0)}
              icon="work"
            />
            <StatCard
              label="Applications sent"
              value={
                isLoading ? "—" : String(data?.recentApplications.length ?? 0)
              }
              icon="description"
            />
            <StatCard
              label="Strong matches"
              value={
                isLoading
                  ? "—"
                  : String(
                      data?.recentMatches.filter((match) => match.score >= 75)
                        .length ?? 0,
                    )
              }
              icon="auto_awesome"
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-[1.75rem] border border-outline-variant bg-surface p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                    Job listings
                  </p>
                  <h2 className="mt-2 text-2xl tracking-tight text-on-surface">
                    Roles currently surfacing for your profile
                  </h2>
                </div>
                <span className="text-xs uppercase tracking-[0.24em] text-on-surface-variant">
                  {data?.recentMatches.length ?? 0} visible
                </span>
              </div>

              <div className="mt-6 grid gap-4">
                {isLoading
                  ? Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={`job-skeleton-${index}`}
                        className="h-44 animate-pulse rounded-[1.5rem] border border-outline-variant bg-surface-container-low"
                      />
                    ))
                  : data?.recentMatches.map((match) => {
                      const application = appliedByJobId.get(match.jobId);

                      return (
                        <article
                          key={match.id}
                          className="rounded-[1.5rem] border border-outline-variant bg-surface-container-lowest p-5 transition-all hover:border-primary/35"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-4">
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

                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant">
                                  {match.companyName}
                                </p>
                                <h3 className="mt-1 text-xl tracking-tight text-on-surface">
                                  {match.title}
                                </h3>
                                <p className="text-sm text-on-surface-variant">
                                  {match.location} ·{" "}
                                  {match.requiredQualification}
                                </p>
                              </div>
                            </div>

                            <span
                              className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] ${getMatchTone(match.matchType)}`}
                            >
                              {match.matchType}
                            </span>
                          </div>

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

                          <div className="mt-5 flex items-center justify-between gap-3 border-t border-outline-variant pt-4">
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                                Match score
                              </p>
                              <p className="mt-1 text-lg font-semibold text-on-surface">
                                {match.score.toFixed(0)}%
                              </p>
                            </div>

                            <button
                              type="button"
                              disabled={Boolean(application)}
                              onClick={() => applyMutation.mutate(match.jobId)}
                              className="inline-flex items-center gap-2 rounded-full border border-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:border-outline-variant disabled:text-on-surface-variant"
                            >
                              {application ? application.status : "Apply"}
                            </button>
                          </div>
                        </article>
                      );
                    })}
              </div>
            </article>

            <article className="rounded-[1.75rem] border border-outline-variant bg-surface p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                    Applied jobs
                  </p>
                  <h2 className="mt-2 text-2xl tracking-tight text-on-surface">
                    Submitted applications and current status
                  </h2>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-[1.25rem] border border-outline-variant">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-low text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Job</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/60 bg-surface-container-lowest">
                    {isLoading
                      ? Array.from({ length: 4 }).map((_, index) => (
                          <tr key={`applications-skeleton-${index}`}>
                            <td colSpan={2} className="px-4 py-5">
                              <div className="h-6 animate-pulse rounded bg-surface-container-low" />
                            </td>
                          </tr>
                        ))
                      : data?.recentApplications.map((application) => (
                          <tr key={application.id}>
                            <td className="px-4 py-5">
                              <div className="space-y-1">
                                <p className="font-semibold text-on-surface">
                                  {application.title}
                                </p>
                                <p className="text-sm text-on-surface-variant">
                                  {application.companyName} ·{" "}
                                  {application.location}
                                </p>
                                <p className="text-[11px] uppercase tracking-[0.22em] text-on-surface-variant">
                                  Applied{" "}
                                  {new Date(
                                    application.appliedAt,
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-5">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] ${getStatusTone(application.status)}`}
                              >
                                {application.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-dashed border-outline-variant bg-surface-container-low p-5">
                <h3 className="text-lg font-semibold text-on-surface">
                  Keep the list moving
                </h3>
                <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                  Open any company profile, compare requirements, and keep
                  applying to roles that fit your qualifications.
                </p>
                <Link
                  href="/jobs"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground"
                >
                  Browse public jobs
                </Link>
              </div>
            </article>
          </section>
        </div>
      </div>
    </JobSeekerPortalShell>
  );
}

export function JobSeekerMatchesPage() {
  const { data, isLoading, isError, error, refetch } =
    useJobSeekerDashboardQuery();
  const applyMutation = useApplyToJobMutation();

  const averageScore = useMemo(() => {
    if (!data?.recentMatches.length) {
      return 0;
    }

    return (
      data.recentMatches.reduce((total, match) => total + match.score, 0) /
      data.recentMatches.length
    );
  }, [data?.recentMatches]);

  return (
    <JobSeekerPortalShell
      activeSection="matches"
      actionHref="/jobs"
      actionLabel="Browse jobs"
    >
      <div className="bg-[radial-gradient(circle_at_top_right,rgba(240,168,120,0.18),transparent_28%),linear-gradient(180deg,#faf5ee_0%,#f8f1e7_100%)] text-on-background">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <header className="rounded-[2rem] border border-outline-variant bg-surface-container-lowest/95 p-6 shadow-[0_18px_50px_rgba(58,48,42,0.08)] backdrop-blur sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">
                  Match intelligence
                </p>
                <h1 className="text-4xl tracking-tight text-on-surface sm:text-5xl">
                  Jobs that align tightly with your profile
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-on-surface-variant sm:text-base">
                  These recommendations are ranked from your current skills,
                  qualification, and historic match score so the best fits stay
                  on top.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/onboarding/job-seeker/dashboard/jobs"
                  className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
                >
                  View jobs
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

          {isError ? (
            <section className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-6 text-rose-700">
              <p className="font-semibold">Unable to load your matches.</p>
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

          <section className="grid gap-6 md:grid-cols-3">
            <StatCard
              label="Average match score"
              value={isLoading ? "—" : `${averageScore.toFixed(0)}%`}
              icon="percent"
            />
            <StatCard
              label="Matches visible"
              value={isLoading ? "—" : String(data?.recentMatches.length ?? 0)}
              icon="auto_awesome"
            />
            <StatCard
              label="Skills tracked"
              value={isLoading ? "—" : String(data?.seeker.skills.length ?? 0)}
              icon="psychology"
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-[1.75rem] border border-outline-variant bg-surface p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                    Matched jobs
                  </p>
                  <h2 className="mt-2 text-2xl tracking-tight text-on-surface">
                    Roles ranked by fit
                  </h2>
                </div>
                <span className="text-xs uppercase tracking-[0.24em] text-on-surface-variant">
                  {data?.recentMatches.length ?? 0} visible
                </span>
              </div>

              <div className="mt-6 grid gap-4">
                {isLoading
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={`match-view-skeleton-${index}`}
                        className="h-52 animate-pulse rounded-[1.5rem] border border-outline-variant bg-surface-container-low"
                      />
                    ))
                  : data?.recentMatches.map((match) => (
                      <article
                        key={match.id}
                        className="rounded-[1.5rem] border border-outline-variant bg-surface-container-lowest p-5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-4">
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

                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant">
                                {match.companyName}
                              </p>
                              <h3 className="mt-1 text-xl tracking-tight text-on-surface">
                                {match.title}
                              </h3>
                              <p className="text-sm text-on-surface-variant">
                                {match.location} · {match.requiredQualification}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] ${getMatchTone(match.matchType)}`}
                          >
                            {match.matchType}
                          </span>
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold uppercase tracking-[0.22em] text-on-surface-variant">
                              <span>Score</span>
                              <span className="text-on-surface">
                                {match.score.toFixed(0)}%
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-stone-100">
                              <progress
                                value={Math.min(100, match.score)}
                                max={100}
                                aria-label="Match score progress"
                                className="match-progress h-2 w-full overflow-hidden rounded-full bg-stone-100 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-stone-100 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-primary"
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => applyMutation.mutate(match.jobId)}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                          >
                            Apply
                          </button>
                        </div>

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
                      </article>
                    ))}
              </div>
            </article>

            <article className="rounded-[1.75rem] border border-outline-variant bg-surface p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                  Fit snapshot
                </p>
                <h2 className="text-2xl tracking-tight text-on-surface">
                  Why these roles appear first
                </h2>
                <p className="text-sm leading-7 text-on-surface-variant">
                  The matching engine is reading your current qualification and
                  skill mix, then prioritizing roles that show the strongest
                  overlap.
                </p>
              </div>

              <div className="mt-6 space-y-4 rounded-[1.5rem] border border-outline-variant bg-surface-container-low p-5">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.22em] text-on-surface-variant">
                  <span>Qualification</span>
                  <span className="text-on-surface">
                    {data?.seeker.qualification ?? "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.22em] text-on-surface-variant">
                  <span>Onboarding</span>
                  <span className="text-on-surface">
                    {data?.seeker.onboardingStatus ?? "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.22em] text-on-surface-variant">
                  <span>Verification</span>
                  <span className="text-on-surface">
                    {data?.seeker.verificationStatus ?? "—"}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold text-on-surface">
                  Your strongest signals
                </h3>
                <ul className="space-y-3">
                  {(data?.seeker.skills ?? []).slice(0, 6).map((skill) => (
                    <li key={skill} className="flex items-center gap-3">
                      <MaterialSymbol
                        icon="check_circle"
                        className="text-[18px] text-primary"
                      />
                      <span className="text-sm text-on-surface-variant">
                        {skill}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </section>
        </div>
      </div>
    </JobSeekerPortalShell>
  );
}

export function JobSeekerAnalyticsPage() {
  const { data, isLoading, isError, error, refetch } =
    useJobSeekerDashboardQuery();

  const averageMatchScore = useMemo(() => {
    if (!data?.recentMatches.length) {
      return 0;
    }

    return (
      data.recentMatches.reduce((total, match) => total + match.score, 0) /
      data.recentMatches.length
    );
  }, [data?.recentMatches]);

  const statusCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const application of data?.recentApplications ?? []) {
      counts.set(application.status, (counts.get(application.status) ?? 0) + 1);
    }

    return Array.from(counts.entries()).sort(
      (left, right) => right[1] - left[1],
    );
  }, [data?.recentApplications]);

  const topSkills = useMemo(() => {
    const counts = new Map<string, number>();

    for (const match of data?.recentMatches ?? []) {
      for (const skill of match.requiredSkills) {
        counts.set(skill, (counts.get(skill) ?? 0) + 1);
      }
    }

    return Array.from(counts.entries())
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5);
  }, [data?.recentMatches]);

  return (
    <JobSeekerPortalShell
      activeSection="analytics"
      actionHref="/onboarding/job-seeker/dashboard/matches"
      actionLabel="View matches"
    >
      <div className="bg-[radial-gradient(circle_at_top_right,rgba(240,168,120,0.18),transparent_28%),linear-gradient(180deg,#faf5ee_0%,#f8f1e7_100%)] text-on-background">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <header className="rounded-[2rem] border border-outline-variant bg-surface-container-lowest/95 p-6 shadow-[0_18px_50px_rgba(58,48,42,0.08)] backdrop-blur sm:p-8">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">
                Viewing analytics
              </p>
              <h1 className="text-4xl tracking-tight text-on-surface sm:text-5xl">
                Track how your profile performs across the marketplace
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-on-surface-variant sm:text-base">
                These analytics summarize application volume, match quality, and
                the skills appearing most often in the roles you are being
                shown.
              </p>
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
              label="Applications"
              value={
                isLoading ? "—" : String(data?.stats.totalApplications ?? 0)
              }
              icon="description"
            />
            <StatCard
              label="Matches"
              value={isLoading ? "—" : String(data?.stats.matchesFound ?? 0)}
              icon="auto_awesome"
            />
            <StatCard
              label="Notifications"
              value={isLoading ? "—" : String(data?.stats.notifications ?? 0)}
              icon="notifications"
            />
            <StatCard
              label="Average score"
              value={isLoading ? "—" : `${averageMatchScore.toFixed(0)}%`}
              icon="percent"
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <article className="rounded-[1.75rem] border border-outline-variant bg-surface p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                Application status mix
              </p>
              <h2 className="mt-2 text-2xl tracking-tight text-on-surface">
                How your submissions are moving
              </h2>

              <div className="mt-6 space-y-4">
                {isLoading
                  ? Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={`analytics-skeleton-${index}`}
                        className="h-16 animate-pulse rounded-[1rem] bg-surface-container-low"
                      />
                    ))
                  : statusCounts.map(([status, count]) => (
                      <MetricBar
                        key={status}
                        label={status}
                        value={count}
                        total={data?.recentApplications.length ?? 1}
                      />
                    ))}
              </div>
            </article>

            <article className="rounded-[1.75rem] border border-outline-variant bg-surface p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                Skill signals
              </p>
              <h2 className="mt-2 text-2xl tracking-tight text-on-surface">
                Skills appearing most often in your matches
              </h2>

              <div className="mt-6 space-y-4">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <div
                        key={`skill-skeleton-${index}`}
                        className="h-14 animate-pulse rounded-[1rem] bg-surface-container-low"
                      />
                    ))
                  : topSkills.map(([skill, count]) => (
                      <div
                        key={skill}
                        className="rounded-[1rem] border border-outline-variant bg-surface-container-low p-4"
                      >
                        <div className="flex items-center justify-between gap-4 text-sm font-semibold text-on-surface">
                          <span>{skill}</span>
                          <span className="text-primary">{count} roles</span>
                        </div>
                      </div>
                    ))}
              </div>
            </article>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <article className="rounded-[1.75rem] border border-outline-variant bg-surface p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                Profile readiness
              </p>
              <h2 className="mt-2 text-2xl tracking-tight text-on-surface">
                What still strengthens your visibility
              </h2>

              <div className="mt-6 space-y-4 rounded-[1.5rem] border border-outline-variant bg-surface-container-low p-5">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.22em] text-on-surface-variant">
                  <span>Qualification</span>
                  <span className="text-on-surface">
                    {data?.seeker.qualification ?? "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.22em] text-on-surface-variant">
                  <span>Onboarding</span>
                  <span className="text-on-surface">
                    {data?.seeker.onboardingStatus ?? "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.22em] text-on-surface-variant">
                  <span>Verification</span>
                  <span className="text-on-surface">
                    {data?.seeker.verificationStatus ?? "—"}
                  </span>
                </div>
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-dashed border-outline-variant bg-surface-container-low p-5">
                <p className="text-sm leading-7 text-on-surface-variant">
                  Keep your profile complete, maintain a focused skill set, and
                  your job recommendations will stay tighter and more accurate.
                </p>
                <Link
                  href="/onboarding/job-seeker"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground"
                >
                  Update profile
                </Link>
              </div>
            </article>

            <article className="rounded-[1.75rem] border border-outline-variant bg-surface p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                Match trend
              </p>
              <h2 className="mt-2 text-2xl tracking-tight text-on-surface">
                Average score by role group
              </h2>

              <div className="mt-6 space-y-4">
                {isLoading
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={`trend-skeleton-${index}`}
                        className="h-16 animate-pulse rounded-[1rem] bg-surface-container-low"
                      />
                    ))
                  : data?.recentMatches
                      .slice(0, 4)
                      .map((match) => (
                        <MetricBar
                          key={match.id}
                          label={match.title}
                          value={Math.round(match.score)}
                          total={100}
                        />
                      ))}
              </div>
            </article>
          </section>
        </div>
      </div>
    </JobSeekerPortalShell>
  );
}

export function JobSeekerSettingsPage() {
  const { data, isLoading, isError, error, refetch } =
    useJobSeekerDashboardQuery();

  return (
    <JobSeekerPortalShell
      activeSection="settings"
      actionHref="/onboarding/job-seeker/dashboard/analytics"
      actionLabel="View analytics"
    >
      <div className="bg-[radial-gradient(circle_at_top_right,rgba(240,168,120,0.18),transparent_28%),linear-gradient(180deg,#faf5ee_0%,#f8f1e7_100%)] text-on-background">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <header className="rounded-[2rem] border border-outline-variant bg-surface-container-lowest/95 p-6 shadow-[0_18px_50px_rgba(58,48,42,0.08)] backdrop-blur sm:p-8">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">
                Viewing settings
              </p>
              <h1 className="text-4xl tracking-tight text-on-surface sm:text-5xl">
                Profile and account settings
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-on-surface-variant sm:text-base">
                Review the profile details the matching engine sees and keep the
                account aligned with the qualification-first workflow.
              </p>
            </div>
          </header>

          {isError ? (
            <section className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-6 text-rose-700">
              <p className="font-semibold">Unable to load settings.</p>
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

          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <article className="rounded-[1.75rem] border border-outline-variant bg-surface p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                Account snapshot
              </p>
              <h2 className="mt-2 text-2xl tracking-tight text-on-surface">
                What the portal currently knows
              </h2>

              <div className="mt-6 space-y-4 rounded-[1.5rem] border border-outline-variant bg-surface-container-low p-5">
                <SettingRow
                  label="Full name"
                  value={data?.seeker.fullName ?? "—"}
                />
                <SettingRow label="Email" value={data?.seeker.email ?? "—"} />
                <SettingRow
                  label="Qualification"
                  value={data?.seeker.qualification ?? "—"}
                />
                <SettingRow
                  label="Onboarding"
                  value={data?.seeker.onboardingStatus ?? "—"}
                />
                <SettingRow
                  label="Verification"
                  value={data?.seeker.verificationStatus ?? "—"}
                />
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-dashed border-outline-variant bg-surface-container-low p-5">
                <h3 className="text-lg font-semibold text-on-surface">
                  Profile hygiene
                </h3>
                <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                  Keep your qualification, skills, and contact details current
                  so the matching engine can keep ranking you accurately.
                </p>
                <Link
                  href="/onboarding/job-seeker"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground"
                >
                  Review onboarding
                </Link>
              </div>
            </article>

            <article className="rounded-[1.75rem] border border-outline-variant bg-surface p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                Skills & preferences
              </p>
              <h2 className="mt-2 text-2xl tracking-tight text-on-surface">
                Signals that shape your matches
              </h2>

              <div className="mt-6 flex flex-wrap gap-2">
                {(data?.seeker.skills ?? []).map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-outline-variant bg-surface-container-low px-3 py-1 text-xs text-on-surface-variant"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <SettingCard
                  title="Search focus"
                  description="Qualification-first recommendations with skill weighting and location fit."
                />
                <SettingCard
                  title="Notification posture"
                  description="Recent dashboard updates are surfaced live so you can respond quickly."
                />
                <SettingCard
                  title="Profile visibility"
                  description="Visible to employers through the matching and applicants flows."
                />
                <SettingCard
                  title="Next step"
                  description="Keep exploring job matches to refine the profile signals further."
                />
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-outline-variant bg-surface-container-low p-5">
                <div className="flex items-center gap-2 text-primary">
                  <MaterialSymbol icon="info" className="text-[18px]" />
                  <p className="text-xs font-semibold uppercase tracking-[0.28em]">
                    Account summary
                  </p>
                </div>
                <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                  {isLoading
                    ? "Loading profile details..."
                    : `Your profile is currently ${data?.seeker.onboardingStatus?.toLowerCase() ?? "in progress"} and ${data?.seeker.verificationStatus?.toLowerCase() ?? "pending"}.`}
                </p>
              </div>
            </article>
          </section>
        </div>
      </div>
    </JobSeekerPortalShell>
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

function MetricBar({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percentage =
    total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;

  return (
    <div className="space-y-2 rounded-[1rem] border border-outline-variant bg-surface-container-low p-4">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.22em] text-on-surface-variant">
        <span>{label}</span>
        <span className="text-on-surface">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-stone-100">
        <progress
          value={percentage}
          max={100}
          aria-label={`${label} progress`}
          className="match-progress h-2 w-full overflow-hidden rounded-full bg-stone-100 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-stone-100 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-primary"
        />
      </div>
    </div>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-outline-variant/60 pb-3 last:border-0 last:pb-0">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-on-surface-variant">
        {label}
      </span>
      <span className="text-sm font-semibold text-on-surface">{value}</span>
    </div>
  );
}

function SettingCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1rem] border border-outline-variant bg-surface-container-low p-4">
      <h3 className="text-sm font-semibold text-on-surface">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-on-surface-variant">
        {description}
      </p>
    </div>
  );
}

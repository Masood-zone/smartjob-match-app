"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { useApplyToJobMutation } from "@/services/applications";
import {
  type JobSeekerDashboardRecentApplication,
  useJobSeekerDashboardQuery,
} from "@/services/job-seeker/dashboard";

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

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getApplicationPriority(
  application: JobSeekerDashboardRecentApplication,
) {
  if (application.status === "ACCEPTED" && application.interview) {
    return {
      label: "Interview scheduled",
      description:
        application.interview.notes?.trim() ||
        `Your meeting is booked for ${formatDateTime(application.interview.date)} at ${application.interview.location}.`,
      tone: "bg-emerald-100 text-emerald-800",
      icon: "event_available",
    };
  }

  if (application.status === "ACCEPTED") {
    return {
      label: "Shortlisted",
      description:
        "The employer moved this application forward. Open the detail page to review the next step and follow up if needed.",
      tone: "bg-amber-100 text-amber-800",
      icon: "priority_high",
    };
  }

  if (application.status === "REJECTED") {
    return {
      label: "Application closed",
      description:
        "This role has been closed out. Keep moving through similar matches to keep your search active.",
      tone: "bg-rose-100 text-rose-800",
      icon: "cancel",
    };
  }

  return {
    label: "Under review",
    description:
      "Your application is still being processed. The next update will appear in the application detail page.",
    tone: "bg-stone-100 text-stone-800",
    icon: "schedule",
  };
}

function getApplicationSummary(
  application: JobSeekerDashboardRecentApplication,
) {
  if (application.status === "ACCEPTED" && application.interview) {
    return `Meeting on ${formatDateTime(application.interview.date)} at ${application.interview.location}`;
  }

  if (application.status === "ACCEPTED") {
    return "Shortlisted and waiting for the next step";
  }

  if (application.status === "REJECTED") {
    return "Employer closed the application";
  }

  return "Application is currently under review";
}

function getApplicationTone(application: JobSeekerDashboardRecentApplication) {
  if (application.status === "ACCEPTED") {
    return "border-emerald-200 bg-emerald-50/60";
  }

  if (application.status === "REJECTED") {
    return "border-rose-200 bg-rose-50/60";
  }

  return "border-outline-variant bg-surface-container-lowest";
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

  const priorityApplication =
    data?.recentApplications.find(
      (application) =>
        application.status === "ACCEPTED" && !application.interview,
    ) ||
    data?.recentApplications.find((application) => application.interview) ||
    data?.recentApplications.find(
      (application) => application.status === "REJECTED",
    ) ||
    data?.recentApplications[0] ||
    null;

  const priorityMeta = priorityApplication
    ? getApplicationPriority(priorityApplication)
    : null;

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
                  Your recommendations, application statuses, and follow-up
                  updates are all pulled from live data so you can move quickly
                  when a role changes.
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

          {priorityApplication && priorityMeta ? (
            <section className="rounded-[1.75rem] border border-primary/20 bg-primary/5 p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
                    <MaterialSymbol
                      icon={priorityMeta.icon}
                      className="text-[16px]"
                    />
                    Priority update
                  </div>
                  <div>
                    <h2 className="text-2xl tracking-tight text-on-surface">
                      {priorityMeta.label}
                    </h2>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-on-surface-variant sm:text-base">
                      {priorityMeta.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 lg:items-end">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] ${priorityMeta.tone}`}
                  >
                    {priorityApplication.status}
                  </span>
                  <Link
                    href={`/onboarding/job-seeker/dashboard/applications/${priorityApplication.id}`}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground"
                  >
                    Open application
                    <MaterialSymbol
                      icon="arrow_forward"
                      className="text-[16px]"
                    />
                  </Link>
                </div>
              </div>
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
                                className="inline-flex items-center gap-2 rounded-full border border-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:border-outline-variant disabled:text-on-surface-variant"
                              >
                                Apply
                              </button>
                            )}
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
                    Current application status
                  </h2>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {isLoading
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={`application-skeleton-${index}`}
                        className="h-32 animate-pulse rounded-[1.5rem] border border-outline-variant bg-surface-container-low"
                      />
                    ))
                  : data?.recentApplications.map((application) => {
                      const priority = getApplicationPriority(application);

                      return (
                        <article
                          key={application.id}
                          className={`rounded-[1.5rem] border p-5 shadow-[0_2px_16px_rgba(58,48,42,0.04)] ${getApplicationTone(application)}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-primary">
                                {application.companyLogoUrl ? (
                                  <Image
                                    src={application.companyLogoUrl}
                                    alt={application.companyName}
                                    width={48}
                                    height={48}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xs font-semibold">
                                    {getCompanyInitials(
                                      application.companyName,
                                    )}
                                  </span>
                                )}
                              </div>

                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-semibold text-on-surface">
                                    {application.title}
                                  </p>
                                  <span
                                    className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] ${getStatusTone(application.status)}`}
                                  >
                                    {application.status}
                                  </span>
                                </div>
                                <p className="text-sm text-on-surface-variant">
                                  {application.companyName} ·{" "}
                                  {application.location}
                                </p>
                                <p className="text-[11px] uppercase tracking-[0.22em] text-on-surface-variant">
                                  Applied {formatDate(application.appliedAt)}
                                </p>
                              </div>
                            </div>

                            <Link
                              href={`/onboarding/job-seeker/dashboard/applications/${application.id}`}
                              className="text-xs font-semibold uppercase tracking-[0.24em] text-primary"
                            >
                              Open
                            </Link>
                          </div>

                          <div className="mt-4 rounded-[1.25rem] border border-outline-variant/60 bg-surface px-4 py-3 text-sm text-on-surface-variant">
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-semibold text-on-surface">
                                {priority.label}
                              </span>
                              <MaterialSymbol
                                icon={priority.icon}
                                className="text-[18px] text-primary"
                              />
                            </div>
                            <p className="mt-2 leading-6">
                              {getApplicationSummary(application)}
                            </p>
                            {application.interview ? (
                              <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-primary">
                                {formatDateTime(application.interview.date)} ·{" "}
                                {application.interview.location}
                              </p>
                            ) : null}
                          </div>
                        </article>
                      );
                    })}
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-dashed border-outline-variant bg-surface-container-low p-5">
                <h3 className="text-lg font-semibold text-on-surface">
                  Keep the list moving
                </h3>
                <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                  Open any application to see interview timing, employer notes,
                  and the next action you should take.
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

                            {application ? (
                              <Link
                                href={`/onboarding/job-seeker/dashboard/applications/${application.id}`}
                                className="inline-flex items-center gap-2 rounded-full border border-outline-variant px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
                              >
                                {application.status}
                              </Link>
                            ) : (
                              <button
                                type="button"
                                disabled={applyMutation.isPending}
                                onClick={() =>
                                  applyMutation.mutate(match.jobId)
                                }
                                className="inline-flex items-center gap-2 rounded-full border border-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:border-outline-variant disabled:text-on-surface-variant"
                              >
                                Apply
                              </button>
                            )}
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

              <div className="mt-6 space-y-4">
                {isLoading
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={`applications-skeleton-${index}`}
                        className="h-32 animate-pulse rounded-[1.5rem] border border-outline-variant bg-surface-container-low"
                      />
                    ))
                  : data?.recentApplications.map((application) => {
                      const priority = getApplicationPriority(application);

                      return (
                        <article
                          key={application.id}
                          className={`rounded-[1.5rem] border p-5 shadow-[0_2px_16px_rgba(58,48,42,0.04)] ${getApplicationTone(application)}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-primary">
                                {application.companyLogoUrl ? (
                                  <Image
                                    src={application.companyLogoUrl}
                                    alt={application.companyName}
                                    width={48}
                                    height={48}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xs font-semibold">
                                    {getCompanyInitials(
                                      application.companyName,
                                    )}
                                  </span>
                                )}
                              </div>

                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-semibold text-on-surface">
                                    {application.title}
                                  </p>
                                  <span
                                    className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] ${getStatusTone(application.status)}`}
                                  >
                                    {application.status}
                                  </span>
                                </div>
                                <p className="text-sm text-on-surface-variant">
                                  {application.companyName} ·{" "}
                                  {application.location}
                                </p>
                                <p className="text-[11px] uppercase tracking-[0.22em] text-on-surface-variant">
                                  Applied {formatDate(application.appliedAt)}
                                </p>
                              </div>
                            </div>

                            <Link
                              href={`/onboarding/job-seeker/dashboard/applications/${application.id}`}
                              className="text-xs font-semibold uppercase tracking-[0.24em] text-primary"
                            >
                              Open
                            </Link>
                          </div>

                          <div className="mt-4 rounded-[1.25rem] border border-outline-variant/60 bg-surface px-4 py-3 text-sm text-on-surface-variant">
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-semibold text-on-surface">
                                {priority.label}
                              </span>
                              <MaterialSymbol
                                icon={priority.icon}
                                className="text-[18px] text-primary"
                              />
                            </div>
                            <p className="mt-2 leading-6">
                              {getApplicationSummary(application)}
                            </p>
                            {application.interview ? (
                              <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-primary">
                                {formatDateTime(application.interview.date)} ·{" "}
                                {application.interview.location}
                              </p>
                            ) : null}
                          </div>
                        </article>
                      );
                    })}
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-dashed border-outline-variant bg-surface-container-low p-5">
                <h3 className="text-lg font-semibold text-on-surface">
                  Keep the list moving
                </h3>
                <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                  Open any application to see interview timing, employer notes,
                  and the next action you should take.
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
                              <div
                                className={`h-full rounded-full bg-primary ${match.score >= 90 ? "w-[90%]" : match.score >= 75 ? "w-3/4" : match.score >= 50 ? "w-1/2" : match.score >= 25 ? "w-1/4" : "w-[10%]"}`}
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
                        key={`status-skeleton-${index}`}
                        className="h-20 animate-pulse rounded-[1.25rem] border border-outline-variant bg-surface-container-low"
                      />
                    ))
                  : statusCounts.map(([status, count]) => (
                      <div
                        key={status}
                        className="rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-on-surface-variant">
                              {status}
                            </p>
                            <p className="mt-1 text-2xl tracking-tight text-on-surface">
                              {count}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] ${getStatusTone(status)}`}
                          >
                            {status}
                          </span>
                        </div>
                      </div>
                    ))}
              </div>
            </article>

            <article className="rounded-[1.75rem] border border-outline-variant bg-surface p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                Top skills driving matches
              </p>
              <h2 className="mt-2 text-2xl tracking-tight text-on-surface">
                Skills appearing most often in your matches
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <div
                        key={`skill-skeleton-${index}`}
                        className="h-28 animate-pulse rounded-[1.25rem] border border-outline-variant bg-surface-container-low"
                      />
                    ))
                  : topSkills.map(([skill, count]) => (
                      <div
                        key={skill}
                        className="rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-4"
                      >
                        <p className="text-sm font-semibold text-on-surface">
                          {skill}
                        </p>
                        <p className="mt-2 text-xs uppercase tracking-[0.22em] text-on-surface-variant">
                          Appears in {count} matches
                        </p>
                      </div>
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
      actionHref="/onboarding/job-seeker"
      actionLabel="Edit profile"
    >
      <div className="bg-[radial-gradient(circle_at_top_right,rgba(240,168,120,0.18),transparent_28%),linear-gradient(180deg,#faf5ee_0%,#f8f1e7_100%)] text-on-background">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <header className="rounded-[2rem] border border-outline-variant bg-surface-container-lowest/95 p-6 shadow-[0_18px_50px_rgba(58,48,42,0.08)] backdrop-blur sm:p-8">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">
                Settings
              </p>
              <h1 className="text-4xl tracking-tight text-on-surface sm:text-5xl">
                Keep your seeker profile current
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-on-surface-variant sm:text-base">
                Update your profile details when your qualifications, skills, or
                availability change so the dashboard keeps producing better
                matches.
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

          <section className="grid gap-6 md:grid-cols-3">
            <StatCard
              label="Profile status"
              value={isLoading ? "—" : (data?.seeker.onboardingStatus ?? "—")}
              icon="badge"
            />
            <StatCard
              label="Verification"
              value={isLoading ? "—" : (data?.seeker.verificationStatus ?? "—")}
              icon="verified"
            />
            <StatCard
              label="Skills listed"
              value={isLoading ? "—" : String(data?.seeker.skills.length ?? 0)}
              icon="psychology"
            />
          </section>

          <section className="rounded-[1.75rem] border border-outline-variant bg-surface p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                  Account
                </p>
                <p className="mt-2 text-lg font-semibold text-on-surface">
                  {data?.seeker.fullName ?? "Your profile"}
                </p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {data?.seeker.email ?? "Email unavailable"}
                </p>
              </div>
              <div className="rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                  Qualification
                </p>
                <p className="mt-2 text-lg font-semibold text-on-surface">
                  {data?.seeker.qualification ?? "Not available"}
                </p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Keep this in sync with your latest education and experience.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[1.25rem] border border-dashed border-outline-variant bg-surface-container-low p-5">
              <h2 className="text-lg font-semibold text-on-surface">
                What to update next
              </h2>
              <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                Open your onboarding profile, refresh your skills and work
                history, then return here to see the match quality improve.
              </p>
              <Link
                href="/onboarding/job-seeker"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground"
              >
                Edit onboarding profile
              </Link>
            </div>
          </section>
        </div>
      </div>
    </JobSeekerPortalShell>
  );
}

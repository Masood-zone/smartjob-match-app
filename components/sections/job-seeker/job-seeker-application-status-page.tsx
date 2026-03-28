"use client";

import Image from "next/image";
import Link from "next/link";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { JobSeekerPortalShell } from "@/components/sections/job-seeker/job-seeker-portal-shell";
import { useJobSeekerApplicationQuery } from "@/services/applications";

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    weekday: "short",
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
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getStatusTone(status: string) {
  if (status === "ACCEPTED") {
    return "bg-emerald-100 text-emerald-800";
  }

  if (status === "REJECTED") {
    return "bg-rose-100 text-rose-800";
  }

  return "bg-amber-100 text-amber-800";
}

function getStatusLabel(status: string) {
  if (status === "ACCEPTED") return "Shortlisted";
  if (status === "REJECTED") return "Closed";
  return "In review";
}

export function JobSeekerApplicationStatusPage({
  applicationId,
}: {
  applicationId: string;
}) {
  const { data, isLoading, isError, error, refetch } =
    useJobSeekerApplicationQuery(applicationId);

  return (
    <JobSeekerPortalShell
      activeSection="dashboard"
      actionHref="/onboarding/job-seeker/dashboard/jobs"
      actionLabel="Browse jobs"
    >
      <div className="bg-[radial-gradient(circle_at_top_right,rgba(240,168,120,0.18),transparent_28%),linear-gradient(180deg,#faf5ee_0%,#f8f1e7_100%)] text-on-background">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <header className="rounded-[2rem] border border-outline-variant bg-surface-container-lowest/95 p-6 shadow-[0_18px_50px_rgba(58,48,42,0.08)] backdrop-blur sm:p-8 lg:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">
                  Application detail
                </p>
                <h1 className="max-w-3xl text-4xl tracking-tight text-on-surface sm:text-5xl">
                  See exactly what is happening with this application
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-on-surface-variant sm:text-base">
                  This page is built for the job seeker view. It shows the
                  latest status, the employer response, interview information,
                  and the next action you should take.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/onboarding/job-seeker/dashboard"
                  className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
                >
                  Back to dashboard
                </Link>
                <Link
                  href="/onboarding/job-seeker/dashboard/matches"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground"
                >
                  View matches
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
              <p className="font-semibold">Unable to load the application.</p>
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

          {isLoading ? (
            <div className="space-y-6">
              <div className="h-44 animate-pulse rounded-[1.75rem] border border-outline-variant bg-surface" />
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="h-72 animate-pulse rounded-[1.75rem] border border-outline-variant bg-surface" />
                <div className="h-72 animate-pulse rounded-[1.75rem] border border-outline-variant bg-surface" />
              </div>
              <div className="h-56 animate-pulse rounded-[1.75rem] border border-outline-variant bg-surface" />
            </div>
          ) : data ? (
            <div className="space-y-6">
              <section className="rounded-[2rem] border border-primary/15 bg-surface-container-lowest p-6 shadow-[0_18px_50px_rgba(58,48,42,0.08)] sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-start gap-5">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[1.5rem] bg-primary/10 text-primary">
                      {data.job.company.logoUrl ? (
                        <Image
                          src={data.job.company.logoUrl}
                          alt={data.job.company.name}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <MaterialSymbol
                          icon="business"
                          className="text-[28px]"
                        />
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] ${getStatusTone(data.status)}`}
                        >
                          {data.status}
                        </span>
                        <span className="rounded-full border border-outline-variant bg-surface px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
                          {getStatusLabel(data.status)}
                        </span>
                      </div>
                      <h2 className="text-3xl tracking-tight text-on-surface sm:text-4xl">
                        {data.job.title}
                      </h2>
                      <p className="text-sm text-on-surface-variant">
                        {data.job.company.name} · {data.job.company.industry} ·{" "}
                        {data.job.company.location}
                      </p>
                      <p className="max-w-3xl text-sm leading-7 text-on-surface-variant sm:text-base">
                        {data.tracking.statusHeadline} ·{" "}
                        {data.tracking.nextAction}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 lg:flex-col lg:items-end">
                    <Link
                      href={`/companies/${data.job.company.id}`}
                      className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
                    >
                      Open company
                    </Link>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
                      Updated {formatDate(data.updatedAt)}
                    </span>
                  </div>
                </div>
              </section>

              <section className="grid gap-4 md:grid-cols-3">
                <InfoCard
                  label="Applied"
                  value={formatDate(data.appliedAt)}
                  icon="history"
                />
                <InfoCard
                  label="Match score"
                  value={
                    data.matchScore !== null
                      ? `${data.matchScore.toFixed(0)}%`
                      : "Unavailable"
                  }
                  icon="percent"
                />
                <InfoCard
                  label="Meeting"
                  value={data.interview ? "Scheduled" : "Not scheduled"}
                  icon="event_available"
                />
              </section>

              <section className="rounded-[1.75rem] border border-outline-variant bg-surface p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                      Application timeline
                    </p>
                    <h3 className="mt-2 text-2xl tracking-tight text-on-surface">
                      What has happened so far
                    </h3>
                  </div>
                  <MaterialSymbol
                    icon="timeline"
                    className="text-[22px] text-primary"
                  />
                </div>

                <ol className="mt-6 space-y-4">
                  {data.tracking.timeline.map((step, index) => (
                    <li
                      key={`${step.title}-${index}`}
                      className="rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-4"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full ${step.completed ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-500"}`}
                        >
                          <MaterialSymbol
                            icon={step.completed ? "check" : "schedule"}
                            className="text-[16px]"
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-on-surface">
                            {step.title}
                          </h4>
                          <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <article className="rounded-[1.75rem] border border-outline-variant bg-surface p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                    Role details
                  </p>
                  <h3 className="mt-2 text-2xl tracking-tight text-on-surface">
                    What the role is asking for
                  </h3>

                  <div className="mt-6 space-y-4 text-sm leading-7 text-on-surface-variant">
                    <p>{data.job.description}</p>
                    <p>
                      Qualification:{" "}
                      <span className="font-semibold text-on-surface">
                        {data.job.requiredQualification}
                      </span>
                    </p>
                    <p>
                      Location:{" "}
                      <span className="font-semibold text-on-surface">
                        {data.job.location}
                      </span>
                    </p>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
                        Required skills
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {data.job.requiredSkills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-outline-variant bg-surface-container-low px-3 py-1 text-[11px] text-on-surface-variant"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>

                <article className="rounded-[1.75rem] border border-outline-variant bg-surface p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                    Follow-up state
                  </p>
                  <h3 className="mt-2 text-2xl tracking-tight text-on-surface">
                    How to respond now
                  </h3>

                  <div className="mt-6 space-y-4 rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-5">
                    <p className="text-sm font-semibold text-on-surface">
                      {data.tracking.nextAction}
                    </p>
                    <p className="text-sm leading-7 text-on-surface-variant">
                      {data.status === "ACCEPTED" && !data.interview
                        ? "The employer has shortlisted your application. Watch for a meeting request or reach out politely if needed."
                        : data.interview
                          ? "The employer has already added a meeting. Review the details below and prepare accordingly."
                          : data.status === "REJECTED"
                            ? "No more action is required for this role. Keep applying to strong matches to stay active."
                            : "The application is still moving through review, so stay alert for the next update."}
                    </p>
                  </div>

                  <div className="mt-4 space-y-4 rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-5">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-semibold text-on-surface">
                        Interview
                      </span>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
                        {data.interview ? "Scheduled" : "Pending"}
                      </span>
                    </div>
                    {data.interview ? (
                      <div className="space-y-2 text-sm text-on-surface-variant">
                        <p>{formatDateTime(data.interview.date)}</p>
                        <p>{data.interview.location}</p>
                        {data.interview.notes ? (
                          <p className="leading-6">{data.interview.notes}</p>
                        ) : null}
                      </div>
                    ) : (
                      <p className="text-sm leading-7 text-on-surface-variant">
                        No meeting has been scheduled yet.
                      </p>
                    )}
                  </div>
                </article>
              </section>

              <section className="rounded-[1.75rem] border border-outline-variant bg-surface p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                  Profile notes
                </p>
                <h3 className="mt-2 text-2xl tracking-tight text-on-surface">
                  Your profile summary for this application
                </h3>
                <div className="mt-4 rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-5 text-sm leading-7 text-on-surface-variant">
                  <p>{data.seeker.profile?.summary || data.seeker.summary}</p>
                  <p className="mt-3">
                    Current role:{" "}
                    <span className="font-semibold text-on-surface">
                      {data.seeker.profile?.currentRole}
                    </span>{" "}
                    · Current company:{" "}
                    <span className="font-semibold text-on-surface">
                      {data.seeker.profile?.currentCompany}
                    </span>
                  </p>
                </div>
              </section>
            </div>
          ) : null}
        </div>
      </div>
    </JobSeekerPortalShell>
  );
}

function InfoCard({
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
            {label}
          </p>
          <p className="mt-3 text-sm font-semibold text-on-surface">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <MaterialSymbol icon={icon} className="text-[18px]" />
        </div>
      </div>
    </div>
  );
}

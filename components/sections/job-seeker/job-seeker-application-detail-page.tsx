"use client";

import Image from "next/image";
import Link from "next/link";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { JobSeekerPortalShell } from "@/components/sections/job-seeker/job-seeker-portal-shell";
import { useApplicationQuery } from "@/services/applications";

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

function getApplicationState(data: {
  status: string;
  interview: { date: string; location: string; notes: string | null } | null;
}) {
  if (data.status === "ACCEPTED" && data.interview) {
    return {
      title: "Interview scheduled",
      summary: `Your meeting is set for ${formatDateTime(data.interview.date)} at ${data.interview.location}.`,
      icon: "event_available",
      tone: "bg-emerald-100 text-emerald-800",
      urgency: "Low urgency",
      action: "Prepare for the meeting and review the notes below.",
    };
  }

  if (data.status === "ACCEPTED") {
    return {
      title: "Shortlisted and waiting",
      summary:
        "The employer has accepted your application, but no meeting has been added yet.",
      icon: "priority_high",
      tone: "bg-amber-100 text-amber-800",
      urgency: "Action recommended",
      action:
        "Open this page regularly and follow up politely if the employer has not shared next steps.",
    };
  }

  if (data.status === "REJECTED") {
    return {
      title: "Application closed",
      summary: "The employer has decided not to move forward with this role.",
      icon: "cancel",
      tone: "bg-rose-100 text-rose-800",
      urgency: "No further action",
      action:
        "Use the application history to guide future applications that match your profile more closely.",
    };
  }

  return {
    title: "Awaiting review",
    summary: "Your application is still being processed by the employer.",
    icon: "schedule",
    tone: "bg-stone-100 text-stone-800",
    urgency: "In progress",
    action:
      "Keep your profile ready so you can respond quickly when the employer updates the status.",
  };
}

export function JobSeekerApplicationDetailPage({
  applicationId,
}: {
  applicationId: string;
}) {
  const { data, isLoading, isError, error, refetch } =
    useApplicationQuery(applicationId);

  return (
    <JobSeekerPortalShell
      activeSection="dashboard"
      actionHref="/onboarding/job-seeker/dashboard/jobs"
      actionLabel="Browse jobs"
    >
      <div className="bg-[radial-gradient(circle_at_top_right,rgba(240,168,120,0.18),transparent_28%),linear-gradient(180deg,#faf5ee_0%,#f8f1e7_100%)] text-on-background">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <header className="rounded-[2rem] border border-outline-variant bg-surface-container-lowest/95 p-6 shadow-[0_18px_50px_rgba(58,48,42,0.08)] backdrop-blur sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">
                  Application detail
                </p>
                <h1 className="text-4xl tracking-tight text-on-surface sm:text-5xl">
                  Track what is happening with this role
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-on-surface-variant sm:text-base">
                  Use this page to see whether the employer has scheduled a
                  meeting, left notes, or expects a call or follow-up.
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
                  View more matches
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
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-6 rounded-[2rem] border border-outline-variant bg-surface p-6 sm:p-8">
                <div className="h-44 animate-pulse rounded-[1.5rem] bg-surface-container-low" />
                <div className="h-52 animate-pulse rounded-[1.5rem] bg-surface-container-low" />
                <div className="h-36 animate-pulse rounded-[1.5rem] bg-surface-container-low" />
              </div>
              <div className="space-y-4 rounded-[1.75rem] border border-outline-variant bg-surface p-6 sm:p-8">
                <div className="h-28 animate-pulse rounded-[1.25rem] bg-surface-container-low" />
                <div className="h-28 animate-pulse rounded-[1.25rem] bg-surface-container-low" />
                <div className="h-36 animate-pulse rounded-[1.25rem] bg-surface-container-low" />
              </div>
            </div>
          ) : data ? (
            (() => {
              const state = getApplicationState(data);
              const hasInterviewNotes = Boolean(data.interview?.notes?.trim());

              return (
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                  <article className="space-y-6">
                    <section className="rounded-[2rem] border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_18px_50px_rgba(58,48,42,0.08)] sm:p-8">
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex items-start gap-5">
                          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-primary">
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
                              <span
                                className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] ${state.tone}`}
                              >
                                {state.urgency}
                              </span>
                            </div>
                            <h2 className="text-3xl tracking-tight text-on-surface sm:text-4xl">
                              {data.job.title}
                            </h2>
                            <p className="text-sm text-on-surface-variant">
                              {data.job.company.name} ·{" "}
                              {data.job.company.industry} ·{" "}
                              {data.job.company.location}
                            </p>
                            <p className="text-sm leading-7 text-on-surface-variant">
                              {state.summary}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-[1.5rem] border border-outline-variant bg-surface p-5 text-left lg:w-72">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
                            Current state
                          </p>
                          <h3 className="mt-2 text-xl tracking-tight text-on-surface">
                            {state.title}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                            {state.action}
                          </p>
                        </div>
                      </div>
                    </section>

                    <section className="grid gap-6 sm:grid-cols-3">
                      <InfoCard
                        label="Applied at"
                        value={formatDateTime(data.appliedAt)}
                        icon="history"
                      />
                      <InfoCard
                        label="Location"
                        value={data.job.location}
                        icon="location_on"
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
                    </section>

                    <section className="rounded-[1.75rem] border border-outline-variant bg-surface p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="text-2xl tracking-tight text-on-surface">
                          What is happening now
                        </h3>
                        <MaterialSymbol
                          icon={state.icon}
                          className="text-[22px] text-primary"
                        />
                      </div>

                      <div className="mt-6 space-y-4">
                        <div className="rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-5">
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                            Next step
                          </p>
                          <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                            {state.action}
                          </p>
                        </div>

                        <div className="rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-5">
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                            Employer notes
                          </p>
                          <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                            {data.seeker.profile?.notes ||
                              data.seeker.profile?.summary ||
                              data.seeker.summary}
                          </p>
                        </div>

                        <div className="rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-5">
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                            Recommended follow-up
                          </p>
                          <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                            {data.status === "ACCEPTED" && !data.interview
                              ? "This role has been shortlisted. A polite follow-up call or message is appropriate if the employer does not share meeting details soon."
                              : data.interview
                                ? hasInterviewNotes
                                  ? "Review the notes and arrive prepared so you can respond to any request immediately."
                                  : "Prepare your documents and be ready to respond quickly if the employer sends an extra instruction or call request."
                                : data.status === "REJECTED"
                                  ? "No further action is required for this application."
                                  : "Stay responsive and keep your profile current while the application is still being reviewed."}
                          </p>
                        </div>
                      </div>
                    </section>
                  </article>

                  <aside className="space-y-4">
                    <section className="rounded-[1.75rem] border border-outline-variant bg-surface p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                        Meeting status
                      </p>
                      <div className="mt-4 rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold text-on-surface">
                            {data.interview ? "Scheduled" : "Not scheduled"}
                          </span>
                          <MaterialSymbol
                            icon="calendar_month"
                            className="text-[18px] text-primary"
                          />
                        </div>
                        {data.interview ? (
                          <div className="mt-4 space-y-2 text-sm text-on-surface-variant">
                            <p>{formatDateTime(data.interview.date)}</p>
                            <p>{data.interview.location}</p>
                            {data.interview.notes ? (
                              <p className="leading-6">
                                {data.interview.notes}
                              </p>
                            ) : null}
                          </div>
                        ) : (
                          <p className="mt-4 text-sm leading-6 text-on-surface-variant">
                            No interview has been booked yet. Check back here
                            for the next employer update.
                          </p>
                        )}
                      </div>
                    </section>

                    <section className="rounded-[1.75rem] border border-outline-variant bg-surface p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                        Job snapshot
                      </p>
                      <div className="mt-4 space-y-3 text-sm text-on-surface-variant">
                        <p>Qualification: {data.job.requiredQualification}</p>
                        <p>
                          Skills:{" "}
                          {data.job.requiredSkills.slice(0, 5).join(", ") ||
                            "None listed"}
                        </p>
                        <p>Company: {data.job.company.name}</p>
                      </div>
                    </section>

                    <section className="rounded-[1.75rem] border border-outline-variant bg-surface p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                        Quick links
                      </p>
                      <div className="mt-4 space-y-3">
                        <Link
                          href="/onboarding/job-seeker/dashboard"
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-outline-variant bg-surface-container-low px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
                        >
                          Back to dashboard
                        </Link>
                        <Link
                          href="/jobs"
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground"
                        >
                          Browse more jobs
                        </Link>
                      </div>
                    </section>
                  </aside>
                </div>
              );
            })()
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

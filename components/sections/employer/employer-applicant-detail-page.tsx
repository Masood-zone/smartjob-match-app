"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { EmployerPortalShell } from "@/components/sections/employer/employer-portal-shell";
import {
  useApplicationQuery,
  useUpdateApplicationStatusMutation,
} from "@/services/applications";
import { useScheduleInterviewMutation } from "@/services/interviews";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(value: string | null) {
  if (!value) return "Present";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function getStatusTone(status: string) {
  if (status === "ACCEPTED") return "bg-emerald-100 text-emerald-800";
  if (status === "REJECTED") return "bg-rose-100 text-rose-800";
  return "bg-amber-100 text-amber-800";
}

export function EmployerApplicantDetailPage({
  applicationId,
}: {
  applicationId: string;
}) {
  const { data, isLoading, isError, error, refetch } =
    useApplicationQuery(applicationId);
  const updateApplicationMutation = useUpdateApplicationStatusMutation();
  const scheduleInterviewMutation = useScheduleInterviewMutation();
  const [interviewDraft, setInterviewDraft] = useState<{
    applicationId: string;
    date: string;
    location: string;
    notes: string;
  } | null>(null);

  return (
    <EmployerPortalShell
      activeSection="applicants"
      actionHref="/onboarding/employer/jobs/new"
      actionLabel="Post a Job"
    >
      <div className="bg-[radial-gradient(circle_at_top_right,rgba(240,168,120,0.12),transparent_30%),linear-gradient(180deg,#faf5ee_0%,#f8f1e7_100%)] text-on-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <header className="mb-8 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">
              Candidate profile
            </p>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl tracking-tight text-on-surface sm:text-5xl">
                  Applicant detail
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-on-surface-variant sm:text-base">
                  A route-scoped candidate profile for review, shortlist
                  actions, and interview scheduling.
                </p>
              </div>
              <Link
                href={
                  data
                    ? `/onboarding/employer/applicants?jobId=${data.jobId}`
                    : "/onboarding/employer/applicants"
                }
                className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
              >
                Back to applicants
              </Link>
            </div>
          </header>

          {isError ? (
            <section className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-6 text-rose-700">
              <p className="font-semibold">Unable to load applicant detail.</p>
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
                <div className="h-56 animate-pulse rounded-[1.5rem] bg-surface-container-low" />
                <div className="h-32 animate-pulse rounded-[1.5rem] bg-surface-container-low" />
              </div>
              <div className="space-y-4 rounded-[1.75rem] border border-outline-variant bg-surface p-6 sm:p-8">
                <div className="h-20 animate-pulse rounded-[1.25rem] bg-surface-container-low" />
                <div className="h-20 animate-pulse rounded-[1.25rem] bg-surface-container-low" />
                <div className="h-64 animate-pulse rounded-[1.25rem] bg-surface-container-low" />
              </div>
            </div>
          ) : data ? (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <article className="space-y-6">
                <section className="rounded-[2rem] border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_18px_50px_rgba(58,48,42,0.08)] sm:p-8">
                  <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start">
                      <div className="relative">
                        <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-surface-container-high bg-primary/10 text-primary shadow-xl">
                          {data.seeker.image ? (
                            <Image
                              src={data.seeker.image}
                              alt={data.seeker.fullName}
                              width={144}
                              height={144}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl font-semibold">
                              {getInitials(data.seeker.fullName)}
                            </span>
                          )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 flex h-12 w-12 items-center justify-center rounded-full border-4 border-surface bg-primary text-on-primary shadow-lg">
                          <MaterialSymbol
                            icon="verified"
                            className="text-[18px]"
                          />
                        </div>
                      </div>

                      <div className="max-w-2xl space-y-4 text-center md:text-left">
                        <div className="flex flex-wrap justify-center gap-4 md:justify-start">
                          <span className="rounded-full border border-outline-variant bg-surface-container-high px-4 py-2 text-sm font-semibold text-on-surface">
                            {data.seeker.location}
                          </span>
                          <span className="rounded-full border border-outline-variant bg-surface-container-high px-4 py-2 text-sm font-semibold text-on-surface">
                            {data.seeker.email}
                          </span>
                        </div>
                        <h2 className="text-5xl tracking-tight text-on-surface sm:text-6xl">
                          {data.seeker.fullName}
                        </h2>
                        <p className="text-xl text-on-surface-variant">
                          {data.seeker.profile?.currentRole ||
                            data.seeker.qualification}{" "}
                          ·{" "}
                          {data.seeker.profile?.currentCompany ||
                            data.job.title}
                        </p>
                        <p className="text-sm leading-7 text-on-surface-variant sm:text-base">
                          {data.seeker.profile?.summary || data.seeker.summary}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-[2rem] border border-primary/20 bg-primary/5 p-8 text-center">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                        Match score
                      </p>
                      <div className="relative mx-auto mt-4 flex h-32 w-32 items-center justify-center">
                        <svg className="h-32 w-32 -rotate-90 transform">
                          <circle
                            cx="64"
                            cy="64"
                            r="58"
                            fill="transparent"
                            stroke="currentColor"
                            strokeWidth="8"
                            className="text-surface-container-high"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="58"
                            fill="transparent"
                            stroke="currentColor"
                            strokeDasharray="364.4"
                            strokeDashoffset={
                              364.4 - (364.4 * (data.matchScore ?? 0)) / 100
                            }
                            strokeLinecap="round"
                            strokeWidth="8"
                            className="text-primary"
                          />
                        </svg>
                        <span className="absolute font-serif text-4xl font-bold text-primary">
                          {(data.matchScore ?? 0).toFixed(0)}%
                        </span>
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-on-surface">
                        {data.matchType ||
                          data.seeker.profile?.headline ||
                          data.job.requiredQualification}
                      </h3>
                      <p className="mt-2 text-sm text-on-surface-variant">
                        {data.seeker.summary}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="space-y-6">
                    <section className="rounded-[1.75rem] border border-outline-variant bg-surface-container-low p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
                      <div className="flex items-center justify-between gap-4">
                        <h4 className="text-2xl tracking-tight text-on-surface">
                          Professional experience
                        </h4>
                        <MaterialSymbol
                          icon="timeline"
                          className="text-[20px] text-primary"
                        />
                      </div>

                      <div className="relative mt-6 space-y-8">
                        <div className="absolute left-2.75 top-2 bottom-2 w-px bg-outline-variant" />
                        {(data.seeker.profile?.experience.length
                          ? data.seeker.profile.experience
                          : [
                              {
                                jobTitle:
                                  data.seeker.profile?.currentRole ||
                                  "Current or latest role",
                                companyName:
                                  data.seeker.profile?.currentCompany ||
                                  "Company name",
                                startDate: null,
                                endDate: null,
                                isCurrentRole: true,
                                description: data.seeker.summary,
                              },
                            ]
                        ).map((entry, index) => (
                          <div
                            key={`${entry.jobTitle}-${index}`}
                            className="relative pl-10"
                          >
                            <div
                              className={`absolute left-0 top-1.5 h-6 w-6 rounded-full border-4 border-surface ${index === 0 ? "bg-primary" : "bg-outline-variant"}`}
                            />
                            <div className="mb-1 flex items-start justify-between gap-3">
                              <h5 className="text-lg font-semibold text-on-surface">
                                {entry.jobTitle}
                              </h5>
                              <span className="text-xs uppercase tracking-[0.24em] text-on-surface-variant">
                                {formatDate(entry.startDate)} —{" "}
                                {formatDate(entry.endDate)}
                              </span>
                            </div>
                            <p className="mb-2 text-primary font-semibold">
                              {entry.companyName}
                            </p>
                            <p className="text-sm leading-7 text-on-surface-variant">
                              {entry.description || "No description provided."}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="rounded-[1.75rem] border border-outline-variant bg-surface-container-low p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
                      <h4 className="text-2xl tracking-tight text-on-surface">
                        Qualification analysis
                      </h4>

                      <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <MetricCard
                          label="Candidate degree"
                          title={
                            data.seeker.profile?.education?.qualification ||
                            data.seeker.qualification
                          }
                          copy={
                            data.seeker.profile?.education
                              ? `${data.seeker.profile.education.institutionName} · ${data.seeker.profile.education.gradeLevel} · ${data.seeker.profile.education.yearOfCompletion}`
                              : data.seeker.summary
                          }
                          icon="school"
                        />
                        <MetricCard
                          label="Requirement match"
                          title={data.job.requiredQualification}
                          copy={`Required skills: ${data.job.requiredSkills.length}`}
                          icon="description"
                        />
                      </div>

                      <div className="mt-6 rounded-[1.35rem] border border-primary/20 bg-primary/5 p-5">
                        <div className="flex items-center gap-2 text-primary">
                          <MaterialSymbol
                            icon="check_circle"
                            className="text-[18px]"
                          />
                          <span className="text-sm font-semibold uppercase tracking-[0.24em]">
                            Review summary
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                          {data.seeker.profile?.summary || data.seeker.summary}
                        </p>
                      </div>
                    </section>

                    <section className="rounded-[1.75rem] border border-primary/20 bg-surface p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
                      <div className="flex items-center gap-3 mb-4">
                        <MaterialSymbol
                          icon="edit_note"
                          className="text-[20px] text-primary"
                        />
                        <h4 className="text-2xl tracking-tight text-on-surface">
                          Hiring manager notes
                        </h4>
                      </div>
                      <p className="italic leading-relaxed text-on-surface-variant">
                        {data.seeker.profile?.notes ||
                          "No notes recorded for this candidate yet."}
                      </p>
                    </section>
                  </div>

                  <div className="space-y-6">
                    <section className="rounded-[1.75rem] border border-primary/10 bg-surface p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)]">
                      <h4 className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                        Recruitment actions
                      </h4>
                      <div className="space-y-3">
                        <button
                          type="button"
                          onClick={() =>
                            setInterviewDraft({
                              applicationId: data.id,
                              date: data.interview?.date.slice(0, 16) ?? "",
                              location:
                                data.interview?.location || data.job.location,
                              notes: data.interview?.notes || "",
                            })
                          }
                          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-4 font-bold text-on-primary transition-opacity hover:opacity-90"
                        >
                          <MaterialSymbol
                            icon="calendar_today"
                            className="text-[18px]"
                          />
                          Schedule interview
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateApplicationMutation.mutate({
                              applicationId: data.id,
                              status: "ACCEPTED",
                            })
                          }
                          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-high py-4 font-bold text-on-surface transition-colors hover:bg-surface-container"
                        >
                          <MaterialSymbol
                            icon="bookmark"
                            className="text-[18px]"
                          />
                          Shortlist
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateApplicationMutation.mutate({
                              applicationId: data.id,
                              status: "REJECTED",
                            })
                          }
                          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white py-4 font-bold text-rose-700 transition-colors hover:bg-rose-50"
                        >
                          <MaterialSymbol
                            icon="block"
                            className="text-[18px]"
                          />
                          Reject
                        </button>
                      </div>

                      <div className="mt-8 border-t border-outline-variant/40 pt-6">
                        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-secondary">
                          Current status
                        </p>
                        <div
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${getStatusTone(data.status)}`}
                        >
                          <span className="h-2 w-2 rounded-full bg-current" />
                          {data.status}
                        </div>
                      </div>
                    </section>

                    <section className="rounded-[1.75rem] border border-outline-variant bg-surface-container-low p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)]">
                      <h4 className="text-2xl tracking-tight text-on-surface">
                        Skills &amp; expertise
                      </h4>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {data.seeker.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-outline-variant bg-surface px-3 py-1.5 text-xs font-semibold text-on-surface"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </section>

                    {data.interview ? (
                      <section className="rounded-[1.75rem] border border-outline-variant bg-surface-container-low p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)]">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                          Existing interview
                        </p>
                        <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                          {formatDate(data.interview.date)} ·{" "}
                          {data.interview.location}
                        </p>
                        {data.interview.notes ? (
                          <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                            {data.interview.notes}
                          </p>
                        ) : null}
                      </section>
                    ) : null}
                  </div>
                </section>
              </article>

              {interviewDraft ? (
                <section className="rounded-[1.75rem] border border-primary/20 bg-primary/5 p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8 xl:col-start-2 xl:row-start-1 xl:row-span-2">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                        Schedule interview
                      </p>
                      <h4 className="mt-2 text-2xl tracking-tight text-on-surface">
                        Add time, location, and notes
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInterviewDraft(null)}
                      className="rounded-full border border-outline-variant bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="mt-6 space-y-4">
                    <Field label="Date and time">
                      <input
                        type="datetime-local"
                        title="Interview date and time"
                        placeholder="Select interview date and time"
                        value={interviewDraft.date}
                        onChange={(event) =>
                          setInterviewDraft((current) =>
                            current
                              ? { ...current, date: event.target.value }
                              : current,
                          )
                        }
                        className="w-full rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none"
                      />
                    </Field>
                    <Field label="Location">
                      <input
                        title="Interview location"
                        placeholder="Enter interview location"
                        value={interviewDraft.location}
                        onChange={(event) =>
                          setInterviewDraft((current) =>
                            current
                              ? { ...current, location: event.target.value }
                              : current,
                          )
                        }
                        className="w-full rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none"
                      />
                    </Field>
                    <Field label="Notes">
                      <textarea
                        title="Interview notes"
                        placeholder="Add optional interview notes"
                        value={interviewDraft.notes}
                        onChange={(event) =>
                          setInterviewDraft((current) =>
                            current
                              ? { ...current, notes: event.target.value }
                              : current,
                          )
                        }
                        className="min-h-28 w-full rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none"
                      />
                    </Field>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        scheduleInterviewMutation.mutate(
                          {
                            applicationId: interviewDraft.applicationId,
                            date: interviewDraft.date,
                            location: interviewDraft.location,
                            notes: interviewDraft.notes,
                          },
                          {
                            onSuccess: () => setInterviewDraft(null),
                          },
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={scheduleInterviewMutation.isPending}
                    >
                      {scheduleInterviewMutation.isPending
                        ? "Saving..."
                        : "Save interview"}
                    </button>
                  </div>
                </section>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </EmployerPortalShell>
  );
}

function MetricCard({
  label,
  title,
  copy,
  icon,
}: {
  label: string;
  title: string;
  copy: string;
  icon: string;
}) {
  return (
    <div className="rounded-[1.35rem] border border-outline-variant bg-surface-container-low p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <MaterialSymbol icon={icon} className="text-[20px]" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-on-surface-variant">
            {label}
          </p>
          <p className="mt-1 text-lg font-semibold text-on-surface">{title}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-7 text-on-surface-variant">{copy}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
        {label}
      </span>
      {children}
    </label>
  );
}

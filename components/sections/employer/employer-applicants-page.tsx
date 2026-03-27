"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { EmployerPortalShell } from "@/components/sections/employer/employer-portal-shell";
import { useUpdateApplicationStatusMutation } from "@/services/applications";
import { useEmployerDashboardQuery } from "@/services/employer/dashboard";
import { useScheduleInterviewMutation } from "@/services/interviews";
import { useJobApplicantsQuery } from "@/services/jobs";

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

export function EmployerApplicantsPage({
  initialJobId,
}: {
  initialJobId?: string;
}) {
  const { data, isLoading, isError, error, refetch } =
    useEmployerDashboardQuery();
  const updateApplicationMutation = useUpdateApplicationStatusMutation();
  const scheduleInterviewMutation = useScheduleInterviewMutation();

  const jobs = data?.jobs ?? [];

  const [selectedJobId, setSelectedJobId] = useState<string>(
    initialJobId ?? "",
  );
  const [selectedApplicantId, setSelectedApplicantId] = useState<string>("");
  const [interviewDraft, setInterviewDraft] = useState<{
    applicationId: string;
    date: string;
    location: string;
    notes: string;
  } | null>(null);

  useEffect(() => {
    if (!selectedJobId && jobs.length > 0) {
      setSelectedJobId(
        initialJobId && jobs.some((job) => job.id === initialJobId)
          ? initialJobId
          : jobs[0].id,
      );
    }
  }, [initialJobId, jobs, selectedJobId]);

  useEffect(() => {
    setSelectedApplicantId("");
    setInterviewDraft(null);
  }, [selectedJobId]);

  const currentJob = useMemo(
    () => jobs.find((job) => job.id === selectedJobId) ?? null,
    [jobs, selectedJobId],
  );

  const applicantsQuery = useJobApplicantsQuery(selectedJobId);
  const applicants = applicantsQuery.data?.data ?? [];

  useEffect(() => {
    if (!applicants.length) {
      setSelectedApplicantId("");
      return;
    }

    const isSelectedApplicantValid = applicants.some(
      (application) => application.id === selectedApplicantId,
    );

    if (!isSelectedApplicantValid) {
      setSelectedApplicantId(applicants[0].id);
    }
  }, [applicants, selectedApplicantId]);

  const selectedApplicant =
    applicants.find((application) => application.id === selectedApplicantId) ??
    applicants[0] ??
    null;

  const selectedProfile = selectedApplicant?.seeker.profile;
  const selectedJobQualification =
    currentJob?.requiredQualification ?? "DEGREE";
  const selectedMatchScore = selectedApplicant?.matchScore ?? 0;

  return (
    <EmployerPortalShell
      activeSection="applicants"
      actionHref="/onboarding/employer/jobs/new"
      actionLabel="Post a Job"
    >
      <div className="bg-[radial-gradient(circle_at_top_right,rgba(240,168,120,0.12),transparent_30%),linear-gradient(180deg,#faf5ee_0%,#f8f1e7_100%)] text-on-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <header className="mb-8 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">
              Candidate pool
            </p>
            <h1 className="text-4xl tracking-tight text-on-surface sm:text-5xl">
              Applicants and profile review
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-on-surface-variant sm:text-base">
              Select a job to see its applicants, then inspect a live profile,
              schedule interviews, and move strong fits into the shortlist.
            </p>
          </header>

          {isError ? (
            <section className="mb-6 rounded-[1.5rem] border border-rose-200 bg-rose-50 p-6 text-rose-700">
              <p className="font-semibold">Unable to load applicants.</p>
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

          <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
            <aside className="space-y-6 rounded-[1.75rem] border border-outline-variant bg-surface p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                    Jobs
                  </p>
                  <h2 className="mt-2 text-2xl tracking-tight text-on-surface">
                    Open roles with applicants
                  </h2>
                </div>
                <span className="text-xs uppercase tracking-[0.24em] text-on-surface-variant">
                  {jobs.length} roles
                </span>
              </div>

              <div className="grid gap-3">
                {isLoading
                  ? Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={`job-skeleton-${index}`}
                        className="h-20 animate-pulse rounded-[1.35rem] border border-outline-variant bg-surface-container-low"
                      />
                    ))
                  : jobs.map((job) => (
                      <button
                        key={job.id}
                        type="button"
                        onClick={() => setSelectedJobId(job.id)}
                        className={`rounded-[1.35rem] border p-4 text-left transition-all ${selectedJobId === job.id ? "border-primary bg-primary/5" : "border-outline-variant bg-surface-container-lowest hover:border-primary/35"}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant">
                              {job.location}
                            </p>
                            <h3 className="mt-1 text-base font-semibold text-on-surface">
                              {job.title}
                            </h3>
                          </div>
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
                            {job.applicationsCount}
                          </span>
                        </div>
                        <p className="mt-3 text-xs uppercase tracking-[0.24em] text-on-surface-variant">
                          {job.requiredQualification}
                        </p>
                      </button>
                    ))}
              </div>

              <div className="rounded-[1.5rem] border border-dashed border-outline-variant bg-surface-container-low p-5 text-sm text-on-surface-variant">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                  Selected job
                </p>
                <p className="mt-2 text-base font-semibold text-on-surface">
                  {currentJob?.title || "No role selected"}
                </p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {currentJob?.applicationsCount ?? 0} applicants ·{" "}
                  {currentJob?.matchesCount ?? 0} matches
                </p>
                <Link
                  href="/onboarding/employer/jobs/new"
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary"
                >
                  Create another role
                </Link>
              </div>
            </aside>

            <section className="space-y-6">
              <header className="rounded-[1.75rem] border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                      {currentJob?.location || "Select a job"}
                    </p>
                    <h2 className="mt-2 text-3xl tracking-tight text-on-surface sm:text-4xl">
                      {currentJob?.title || "Review applicants"}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-on-surface-variant">
                      {currentJob
                        ? `${currentJob.requiredQualification} role with ${currentJob.requiredSkills.length} required skills`
                        : "Choose a job on the left to load its applicant list and candidate profile."}
                    </p>
                  </div>

                  {selectedApplicant ? (
                    <div className="flex items-center gap-4 rounded-[1.5rem] border border-outline-variant bg-surface p-4">
                      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
                        {selectedApplicant.seeker.image ? (
                          <Image
                            src={selectedApplicant.seeker.image}
                            alt={selectedApplicant.seeker.fullName}
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold">
                            {getInitials(selectedApplicant.seeker.fullName)}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                          Selected applicant
                        </p>
                        <h3 className="mt-1 text-lg font-semibold text-on-surface">
                          {selectedApplicant.seeker.fullName}
                        </h3>
                        <p className="text-sm text-on-surface-variant">
                          {selectedApplicant.seeker.location}
                        </p>
                        <Link
                          href={`/onboarding/employer/applicants/${selectedApplicant.id}`}
                          className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary"
                        >
                          Open detailed view
                          <MaterialSymbol
                            icon="arrow_forward"
                            className="text-[14px]"
                          />
                        </Link>
                      </div>
                    </div>
                  ) : null}
                </div>
              </header>

              {!selectedJobId ? (
                <div className="rounded-[1.75rem] border border-dashed border-outline-variant bg-surface p-8 text-center text-on-surface-variant">
                  Select a role to start reviewing applicants.
                </div>
              ) : applicantsQuery.isLoading ? (
                <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                  <div className="space-y-4 rounded-[1.5rem] border border-outline-variant bg-surface p-6">
                    <div className="h-8 animate-pulse rounded-full bg-surface-container-low" />
                    <div className="h-24 animate-pulse rounded-[1.25rem] bg-surface-container-low" />
                    <div className="h-24 animate-pulse rounded-[1.25rem] bg-surface-container-low" />
                  </div>
                  <div className="h-128 animate-pulse rounded-[1.75rem] border border-outline-variant bg-surface" />
                </div>
              ) : applicants.length === 0 ? (
                <div className="rounded-[1.75rem] border border-dashed border-outline-variant bg-surface p-8 text-center text-on-surface-variant">
                  No applicants have applied to this role yet.
                </div>
              ) : (
                <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                  <aside className="space-y-4 rounded-[1.75rem] border border-outline-variant bg-surface p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)]">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                          Applicants
                        </p>
                        <h3 className="mt-2 text-2xl tracking-tight text-on-surface">
                          Candidate list
                        </h3>
                      </div>
                      <span className="text-xs uppercase tracking-[0.24em] text-on-surface-variant">
                        {applicants.length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {applicants.map((application) => {
                        const isSelected =
                          application.id === selectedApplicant?.id;

                        return (
                          <button
                            key={application.id}
                            type="button"
                            onClick={() => {
                              setSelectedApplicantId(application.id);
                              setInterviewDraft(null);
                            }}
                            className={`w-full rounded-[1.35rem] border p-4 text-left transition-all ${isSelected ? "border-primary bg-primary/5" : "border-outline-variant bg-surface-container-lowest hover:border-primary/35"}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
                                {application.seeker.image ? (
                                  <Image
                                    src={application.seeker.image}
                                    alt={application.seeker.fullName}
                                    width={48}
                                    height={48}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xs font-semibold">
                                    {getInitials(application.seeker.fullName)}
                                  </span>
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <h4 className="truncate text-sm font-semibold text-on-surface">
                                  {application.seeker.fullName}
                                </h4>
                                <p className="truncate text-xs text-on-surface-variant">
                                  {application.seeker.qualification} ·{" "}
                                  {application.seeker.location}
                                </p>
                              </div>

                              <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
                                {application.matchScore?.toFixed(0) ?? 0}%
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </aside>

                  {selectedApplicant ? (
                    <article className="space-y-6">
                      <header className="rounded-[2rem] border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_18px_50px_rgba(58,48,42,0.08)] sm:p-8">
                        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
                          <div className="flex flex-col gap-6 md:flex-row md:items-start">
                            <div className="relative">
                              <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-surface-container-high bg-primary/10 text-primary shadow-xl">
                                {selectedApplicant.seeker.image ? (
                                  <Image
                                    src={selectedApplicant.seeker.image}
                                    alt={selectedApplicant.seeker.fullName}
                                    width={144}
                                    height={144}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="text-2xl font-semibold">
                                    {getInitials(
                                      selectedApplicant.seeker.fullName,
                                    )}
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
                                  {selectedApplicant.seeker.location}
                                </span>
                                <span className="rounded-full border border-outline-variant bg-surface-container-high px-4 py-2 text-sm font-semibold text-on-surface">
                                  {selectedApplicant.seeker.email}
                                </span>
                              </div>
                              <h3 className="text-5xl tracking-tight text-on-surface sm:text-6xl">
                                {selectedApplicant.seeker.fullName}
                              </h3>
                              <p className="text-xl text-on-surface-variant">
                                {selectedProfile?.currentRole ||
                                  selectedApplicant.seeker.qualification}{" "}
                                ·{" "}
                                {selectedProfile?.currentCompany ||
                                  selectedApplicant.seeker.location}
                              </p>
                              <p className="text-sm leading-7 text-on-surface-variant sm:text-base">
                                {selectedProfile?.summary ||
                                  selectedApplicant.seeker.summary}
                              </p>
                            </div>
                          </div>

                          <div className="rounded-[2rem] border border-primary/20 bg-primary/5 p-8 text-center">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                              Sahara intelligence match
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
                                    364.4 - (364.4 * selectedMatchScore) / 100
                                  }
                                  strokeLinecap="round"
                                  strokeWidth="8"
                                  className="text-primary"
                                />
                              </svg>
                              <span className="absolute font-serif text-4xl font-bold text-primary">
                                {selectedMatchScore.toFixed(0)}%
                              </span>
                            </div>
                            <h4 className="mt-4 text-lg font-semibold text-on-surface">
                              {selectedApplicant.matchType}
                            </h4>
                            <p className="mt-2 text-sm text-on-surface-variant">
                              {selectedApplicant.seeker.summary}
                            </p>
                          </div>
                        </div>
                      </header>

                      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
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
                              {(selectedProfile?.experience.length
                                ? selectedProfile.experience
                                : [
                                    {
                                      jobTitle:
                                        selectedProfile?.currentRole ||
                                        "Current or latest role",
                                      companyName:
                                        selectedProfile?.currentCompany ||
                                        "Company name",
                                      startDate: null,
                                      endDate: null,
                                      isCurrentRole: true,
                                      description:
                                        selectedApplicant.seeker.summary,
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
                                    {entry.description ||
                                      "No description provided."}
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
                                  selectedProfile?.education?.qualification ||
                                  selectedApplicant.seeker.qualification
                                }
                                copy={
                                  selectedProfile?.education
                                    ? `${selectedProfile.education.institutionName} · ${selectedProfile.education.gradeLevel} · ${selectedProfile.education.yearOfCompletion}`
                                    : selectedApplicant.seeker.summary
                                }
                                icon="school"
                              />
                              <MetricCard
                                label="Requirement match"
                                title={selectedJobQualification}
                                copy={`Profile fit: ${selectedApplicant.matchType}`}
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
                                  Requirements review
                                </span>
                              </div>
                              <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                                {selectedApplicant.seeker.summary}
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
                              {selectedProfile?.notes ||
                                "No notes recorded for this candidate yet. Use the interview panel to capture your review."}
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
                                    applicationId: selectedApplicant.id,
                                    date: "",
                                    location: currentJob?.location || "",
                                    notes: "",
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
                                    applicationId: selectedApplicant.id,
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
                                    applicationId: selectedApplicant.id,
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
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${getStatusTone(selectedApplicant.status)}`}
                              >
                                <span className="h-2 w-2 rounded-full bg-current" />
                                {selectedApplicant.status}
                              </div>
                            </div>
                          </section>

                          <section className="rounded-[1.75rem] border border-outline-variant bg-surface-container-low p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)]">
                            <h4 className="text-2xl tracking-tight text-on-surface">
                              Skills &amp; expertise
                            </h4>
                            <div className="mt-5 flex flex-wrap gap-2">
                              {selectedApplicant.seeker.skills.map((skill) => (
                                <span
                                  key={skill}
                                  className="rounded-full border border-outline-variant bg-surface px-3 py-1.5 text-xs font-semibold text-on-surface"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </section>

                          {selectedApplicant.interview ? (
                            <section className="rounded-[1.75rem] border border-outline-variant bg-surface-container-low p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)]">
                              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                                Existing interview
                              </p>
                              <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                                {formatDate(selectedApplicant.interview.date)} ·{" "}
                                {selectedApplicant.interview.location}
                              </p>
                              {selectedApplicant.interview.notes ? (
                                <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                                  {selectedApplicant.interview.notes}
                                </p>
                              ) : null}
                            </section>
                          ) : null}
                        </div>
                      </div>

                      {interviewDraft ? (
                        <section className="rounded-[1.75rem] border border-primary/20 bg-primary/5 p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
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

                          <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <Field label="Date and time">
                              <input
                                type="datetime-local"
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
                                value={interviewDraft.location}
                                onChange={(event) =>
                                  setInterviewDraft((current) =>
                                    current
                                      ? {
                                          ...current,
                                          location: event.target.value,
                                        }
                                      : current,
                                  )
                                }
                                className="w-full rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none"
                              />
                            </Field>
                          </div>

                          <Field label="Notes">
                            <textarea
                              value={interviewDraft.notes}
                              onChange={(event) =>
                                setInterviewDraft((current) =>
                                  current
                                    ? { ...current, notes: event.target.value }
                                    : current,
                                )
                              }
                              className="mt-2 min-h-24 w-full rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none"
                            />
                          </Field>

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
                              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground"
                            >
                              Save interview
                            </button>
                          </div>
                        </section>
                      ) : null}
                    </article>
                  ) : null}
                </div>
              )}
            </section>
          </div>
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
    <div className="rounded-[1.25rem] border border-outline-variant bg-surface p-4 shadow-[0_2px_16px_rgba(58,48,42,0.04)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MaterialSymbol icon={icon} className="text-[18px]" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">
            {label}
          </p>
          <p className="font-bold text-on-surface">{title}</p>
        </div>
      </div>
      <p className="text-sm text-on-surface-variant">{copy}</p>
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

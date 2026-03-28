"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { signOut } from "@/lib/auth-client";
import { EmployerPortalShell } from "@/components/sections/employer/employer-portal-shell";
import { useEmployerDashboardQuery } from "@/services/employer/dashboard";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatSkillList(skills: string[]) {
  return skills.slice(0, 4);
}

export function EmployerDashboard() {
  const { data, isLoading, isError, error, refetch } =
    useEmployerDashboardQuery();
  const router = useRouter();

  const pendingApplicationsCount = useMemo(
    () =>
      data?.recentApplications.filter(
        (application) => application.status === "PENDING",
      ).length ?? 0,
    [data?.recentApplications],
  );

  const handleLogout = () => {
    void Promise.resolve(signOut()).finally(() => {
      router.replace("/login");
      router.refresh();
    });
  };

  return (
    <EmployerPortalShell
      activeSection="dashboard"
      actionHref="/onboarding/employer/jobs/new"
      actionLabel="Post a Job"
    >
      <div className="bg-[radial-gradient(circle_at_top_right,rgba(240,168,120,0.18),transparent_28%),linear-gradient(180deg,#faf5ee_0%,#f8f1e7_100%)] text-on-background">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <header className="rounded-[2rem] border border-outline-variant bg-surface-container-lowest/95 p-6 shadow-[0_18px_50px_rgba(58,48,42,0.08)] backdrop-blur sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">
                  Employer dashboard
                </p>
                <h1 className="text-4xl tracking-tight text-on-surface sm:text-5xl">
                  Recruitment pulse
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-on-surface-variant sm:text-base">
                  Track active roles, inspect ranked candidates, and move faster
                  on the best matches without juggling multiple screens.
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
                  href="/onboarding/employer/jobs/new"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground"
                >
                  Create new listing
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
              <p className="font-semibold">
                Unable to load your employer dashboard.
              </p>
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
              value={
                isLoading ? "—" : String(data?.stats.totalApplications ?? 0)
              }
              icon="description"
            />
            <StatCard
              label="Matches"
              value={isLoading ? "—" : String(data?.stats.totalMatches ?? 0)}
              icon="auto_awesome"
            />
            <StatCard
              label="Interviews"
              value={isLoading ? "—" : String(data?.stats.totalInterviews ?? 0)}
              icon="event"
            />
          </section>

          {pendingApplicationsCount > 0 ? (
            <section className="overflow-hidden rounded-[2rem] border border-primary/20 bg-primary/5 p-6 shadow-[0_18px_50px_rgba(58,48,42,0.08)] sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-3xl space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
                    <MaterialSymbol
                      icon="notifications_active"
                      className="text-[16px]"
                    />
                    Pending review
                  </div>
                  <h2 className="text-3xl tracking-tight text-on-surface sm:text-4xl">
                    You have {pendingApplicationsCount} applications waiting for
                    review
                  </h2>
                  <p className="max-w-2xl text-sm leading-7 text-on-surface-variant sm:text-base">
                    Open the applicant queue to shortlist talent, schedule the
                    next step, or close roles that are not the right fit yet.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/onboarding/employer/applicants"
                    className="inline-flex items-center gap-2 rounded-full bg-[#c2652a] px-5 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-white shadow-sm transition-colors hover:bg-[#a9531c]"
                  >
                    Go to applicants
                    <MaterialSymbol
                      icon="arrow_forward"
                      className="text-[16px]"
                    />
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface px-5 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant transition-colors hover:border-[#c2652a] hover:text-[#c2652a]"
                  >
                    Log out
                  </button>
                </div>
              </div>
            </section>
          ) : null}

          <section className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
            <article className="rounded-[1.75rem] border border-outline-variant bg-surface p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                    Candidate matches
                  </p>
                  <h2 className="mt-2 text-2xl tracking-tight text-on-surface">
                    Ranked talent for open roles
                  </h2>
                </div>
                <Link
                  href="/onboarding/employer/applicants"
                  className="text-xs uppercase tracking-[0.24em] text-primary transition-colors hover:underline"
                >
                  View all
                </Link>
              </div>

              <div className="mt-6 space-y-4">
                {isLoading
                  ? Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={`match-skeleton-${index}`}
                        className="h-28 animate-pulse rounded-[1.5rem] border border-outline-variant bg-surface-container-low"
                      />
                    ))
                  : data?.topMatches.slice(0, 3).map((match) => (
                      <article
                        key={match.id}
                        className="rounded-[1.5rem] border border-outline-variant bg-surface-container-lowest p-5 transition-shadow hover:shadow-[0_12px_30px_rgba(58,48,42,0.08)]"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
                            {match.seeker.image ? (
                              <Image
                                src={match.seeker.image}
                                alt={match.seeker.fullName}
                                width={56}
                                height={56}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-semibold">
                                {getInitials(match.seeker.fullName)}
                              </span>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-lg font-semibold text-on-surface">
                              {match.seeker.fullName}
                            </h3>
                            <p className="text-sm text-on-surface-variant">
                              {match.seeker.qualification} ·{" "}
                              {match.seeker.location}
                            </p>
                            <p className="mt-1 text-xs uppercase tracking-[0.24em] text-primary">
                              {match.title}
                            </p>
                          </div>

                          <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
                            {match.score.toFixed(0)}%
                          </span>
                        </div>

                        <p className="mt-4 text-sm leading-7 text-on-surface-variant">
                          {match.seeker.summary}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {formatSkillList(match.seeker.skills).map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full border border-outline-variant bg-surface px-3 py-1 text-[11px] text-on-surface-variant"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-outline-variant pt-4">
                          <Link
                            href={`/onboarding/employer/applicants?jobId=${match.jobId}`}
                            className="inline-flex items-center gap-2 rounded-full border border-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary"
                          >
                            Review applicants
                          </Link>
                          <span className="text-xs uppercase tracking-[0.24em] text-on-surface-variant">
                            {match.matchType}
                          </span>
                        </div>
                      </article>
                    ))}
              </div>
            </article>

            <article className="rounded-[1.75rem] border border-outline-variant bg-surface p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                    Job management
                  </p>
                  <h2 className="mt-2 text-2xl tracking-tight text-on-surface">
                    Active roles and applicant counts
                  </h2>
                </div>
                <span className="text-xs uppercase tracking-[0.24em] text-on-surface-variant">
                  {data?.jobs.length ?? 0} listings
                </span>
              </div>

              <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-outline-variant bg-surface-container-lowest shadow-[0_2px_16px_rgba(58,48,42,0.04)]">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-outline-variant/60 bg-surface-container">
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-500">
                        Role Name
                      </th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-500">
                        Applicants
                      </th>
                      <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-stone-500">
                        Matches
                      </th>
                      <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-stone-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {isLoading
                      ? Array.from({ length: 3 }).map((_, index) => (
                          <tr key={`job-row-skeleton-${index}`}>
                            <td colSpan={4} className="px-6 py-5">
                              <div className="h-12 animate-pulse rounded-lg bg-surface-container-low" />
                            </td>
                          </tr>
                        ))
                      : data?.jobs.map((job) => (
                          <tr
                            key={job.id}
                            className="transition-colors hover:bg-stone-50/50"
                          >
                            <td className="px-6 py-5">
                              <div className="font-serif text-base font-bold text-on-surface">
                                {job.title}
                              </div>
                              <div className="text-[10px] uppercase tracking-wide text-stone-400">
                                {job.requiredQualification} · {job.location}
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className="text-sm font-semibold text-on-surface">
                                {job.applicationsCount}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold text-primary">
                                {Math.round(job.topMatchScore)} New
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <Link
                                href={`/onboarding/employer/applicants?jobId=${job.id}`}
                                className="inline-flex items-center gap-2 rounded-full border border-outline-variant px-4 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
                              >
                                View applicants
                              </Link>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 rounded-[1.5rem] border-2 border-dashed border-outline-variant p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-container">
                  <MaterialSymbol
                    icon="add"
                    className="text-[20px] text-stone-400"
                  />
                </div>
                <h3 className="text-xl font-bold text-on-surface">
                  Scale your team further?
                </h3>
                <p className="mx-auto mt-2 max-w-xs text-sm text-on-surface-variant">
                  Define a new role and let the matching engine surface stronger
                  candidates faster.
                </p>
                <Link
                  href="/onboarding/employer/jobs/new"
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#c2652a] px-8 py-3 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Post a New Job
                </Link>
              </div>
            </article>
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

"use client";

import Image from "next/image";
import Link from "next/link";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { useSession } from "@/lib/auth-client";
import { useApplyToJobMutation } from "@/services/applications";
import { useJobSeekerDashboardQuery } from "@/services/job-seeker/dashboard";

function getStatusTone(status: string) {
  if (status === "ACCEPTED") return "bg-emerald-100 text-emerald-800";
  if (status === "REJECTED") return "bg-rose-100 text-rose-800";
  return "bg-amber-100 text-amber-800";
}

function getMatchTone(matchType: string) {
  if (matchType === "EXCELLENT") return "bg-emerald-100 text-emerald-800";
  if (matchType === "GOOD") return "bg-amber-100 text-amber-800";
  if (matchType === "AVERAGE") return "bg-orange-100 text-orange-800";
  return "bg-stone-100 text-stone-800";
}

function getCompanyInitials(companyName: string) {
  return companyName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function JobSeekerDashboard() {
  const { data: session } = useSession();
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(240,168,120,0.18),transparent_28%),linear-gradient(180deg,#faf5ee_0%,#f8f1e7_100%)] text-on-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="rounded-[2rem] border border-outline-variant bg-surface-container-lowest/95 p-6 shadow-[0_18px_50px_rgba(58,48,42,0.08)] backdrop-blur sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">
                Job seeker dashboard
              </p>
              <h1 className="text-4xl tracking-tight text-on-surface sm:text-5xl">
                Welcome back
                {session?.user?.name ? `, ${session.user.name}` : ""}
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-on-surface-variant sm:text-base">
                Your applications, match scores, and new notifications are all
                pulled from live data so every change shows up without a manual
                refresh.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/job-seeker/companies"
                className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
              >
                Browse companies
              </Link>
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground"
              >
                Browse jobs
                <MaterialSymbol icon="arrow_forward" className="text-[16px]" />
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
            value={isLoading ? "—" : String(data?.stats.totalApplications ?? 0)}
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

            {!isLoading && (data?.recentMatches.length ?? 0) === 0 ? (
              <div className="mt-6 rounded-[1.5rem] border border-dashed border-outline-variant bg-surface p-6 text-center text-on-surface-variant">
                No matches are available yet. Complete your profile or apply to
                more jobs to improve the ranking.
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
    </main>
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

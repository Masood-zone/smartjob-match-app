"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { useApplyToJobMutation } from "@/services/applications";
import { useJobsQuery } from "@/services/jobs";

function getCompanyInitials(companyName: string) {
  return companyName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function JobsPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, error, refetch } = useJobsQuery({
    query: search,
  });
  const applyMutation = useApplyToJobMutation();

  const jobs = useMemo(() => data ?? [], [data]);

  return (
    <main className="flex-1 bg-[radial-gradient(circle_at_top_right,rgba(240,168,120,0.18),transparent_28%),linear-gradient(180deg,#faf5ee_0%,#f8f1e7_100%)] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-[2rem] border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_18px_50px_rgba(58,48,42,0.08)] sm:p-8 lg:p-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">
                Job listings
              </p>
              <h1 className="text-4xl tracking-tight text-on-surface sm:text-5xl">
                Find a role that fits the profile, not just the title
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-on-surface-variant sm:text-base">
                Search approved roles, review qualification requirements, and
                apply with one click so the matching engine can update your
                recommendations immediately.
              </p>
            </div>

            <Link
              href="/dashboard/job-seeker/companies"
              className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant"
            >
              Browse companies
            </Link>
          </div>
        </header>

        <section className="rounded-[1.75rem] border border-outline-variant bg-surface p-4 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-5">
          <label className="flex items-center gap-3 rounded-[1.25rem] border border-outline-variant bg-surface-container-low px-4 py-3">
            <MaterialSymbol
              icon="search"
              className="text-[18px] text-primary"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, company, skill, or location..."
              className="w-full bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant"
            />
          </label>
        </section>

        {isError ? (
          <section className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-6 text-rose-700">
            <p className="font-semibold">Unable to load jobs.</p>
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

        <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <article
                  key={`job-skeleton-${index}`}
                  className="h-96 animate-pulse rounded-[1.75rem] border border-outline-variant bg-surface"
                />
              ))
            : jobs.map((job) => (
                <article
                  key={job.id}
                  className="flex flex-col rounded-[1.75rem] border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-primary">
                      {job.companyLogoUrl ? (
                        <Image
                          src={job.companyLogoUrl}
                          alt={job.companyName}
                          width={56}
                          height={56}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold">
                          {getCompanyInitials(job.companyName)}
                        </span>
                      )}
                    </div>

                    <div className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-primary">
                      {job.topMatchScore.toFixed(0)}% match
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant">
                      {job.companyName}
                    </p>
                    <h2 className="text-2xl tracking-tight text-on-surface">
                      {job.title}
                    </h2>
                    <p className="text-sm text-on-surface-variant">
                      {job.location} · {job.requiredQualification}
                    </p>
                  </div>

                  <p className="mt-4 flex-1 text-sm leading-7 text-on-surface-variant">
                    {job.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-outline-variant bg-surface px-3 py-1 text-[11px] font-medium text-on-surface-variant"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant pt-4">
                    <Link
                      href={`/companies/${job.employerId}`}
                      className="text-xs font-semibold uppercase tracking-[0.24em] text-primary"
                    >
                      Company profile
                    </Link>

                    <button
                      type="button"
                      onClick={() => applyMutation.mutate(job.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      Apply now
                      <MaterialSymbol icon="send" className="text-[14px]" />
                    </button>
                  </div>
                </article>
              ))}
        </section>

        {!isLoading && jobs.length === 0 ? (
          <section className="rounded-[1.5rem] border border-dashed border-outline-variant bg-surface p-8 text-center text-on-surface-variant">
            No jobs matched your search.
          </section>
        ) : null}
      </section>
    </main>
  );
}

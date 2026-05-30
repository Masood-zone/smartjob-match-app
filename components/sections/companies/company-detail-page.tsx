"use client";

import Image from "next/image";
import Link from "next/link";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { useApplyToJobMutation } from "@/services/applications";
import { useCompanyQuery } from "@/services/companies";

function getCompanyInitials(companyName: string) {
  return companyName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function CompanyDetailPage({ companyId }: { companyId: string }) {
  const { data, isLoading, isError, error, refetch } =
    useCompanyQuery(companyId);
  const applyMutation = useApplyToJobMutation();

  return (
    <main className="flex-1 bg-[radial-gradient(circle_at_top_right,rgba(240,168,120,0.18),transparent_28%),linear-gradient(180deg,#faf5ee_0%,#f8f1e7_100%)] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="mx-auto max-w-7xl space-y-8">
        {isError ? (
          <section className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-6 text-rose-700">
            <p className="font-semibold">Unable to load company details.</p>
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

        <header className="overflow-hidden rounded-[2rem] border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_18px_50px_rgba(58,48,42,0.08)] sm:p-8 lg:p-10">
          {isLoading ? (
            <div className="h-52 animate-pulse rounded-[1.5rem] bg-surface" />
          ) : data ? (
            <div className="grid gap-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[2rem] bg-primary/10 text-primary">
                {data.logoUrl ? (
                  <Image
                    src={data.logoUrl}
                    alt={data.companyName}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-semibold">
                    {getCompanyInitials(data.companyName)}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-outline-variant bg-surface px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-primary">
                    {data.industry}
                  </span>
                  <span className="text-sm text-on-surface-variant">
                    {data.location}
                  </span>
                </div>
                <h1 className="text-4xl tracking-tight text-on-surface sm:text-5xl">
                  {data.companyName}
                </h1>
                <p className="max-w-3xl text-sm leading-7 text-on-surface-variant sm:text-base">
                  {data.summary}
                </p>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/jobs"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground"
                  >
                    Browse jobs
                    <MaterialSymbol
                      icon="arrow_forward"
                      className="text-[16px]"
                    />
                  </Link>
                  <Link
                    href="/companies"
                    className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant"
                  >
                    Back to companies
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
        </header>

        {data ? (
          <section className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <article className="rounded-[1.75rem] border border-outline-variant bg-surface p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <Metric label="Website" value={data.website || "Unavailable"} />
                <Metric label="Contact email" value={data.companyEmail} />
                <Metric
                  label="Phone"
                  value={data.phoneNumber || "Unavailable"}
                />
                <Metric label="Hiring plan" value={data.employeeRange} />
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-outline-variant bg-surface-container-low p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
                  About the company
                </p>
                <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                  {data.summary}
                </p>
              </div>

              {data.documents.length > 0 ? (
                <div className="mt-6 space-y-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
                    Verification documents
                  </p>
                  {data.documents.map((document) => (
                    <a
                      key={document.href}
                      href={document.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-outline-variant bg-surface px-4 py-3 text-sm text-on-surface-variant transition-colors hover:border-primary/40 hover:text-on-surface"
                    >
                      <span>{document.label}</span>
                      <span className="text-xs uppercase tracking-[0.22em] text-primary">
                        {document.meta}
                      </span>
                    </a>
                  ))}
                </div>
              ) : null}
            </article>

            <aside className="space-y-6 rounded-[1.75rem] border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
              <div className="grid gap-3 sm:grid-cols-3">
                <SmallStat label="Industry" value={data.industry} />
                <SmallStat
                  label="Open roles"
                  value={String(data.jobs.length)}
                />
                <SmallStat label="Focus" value={data.teamFocus} />
              </div>

              <div>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                      Current openings
                    </p>
                    <h2 className="mt-2 text-2xl tracking-tight text-on-surface">
                      Jobs under this company
                    </h2>
                  </div>
                  <span className="text-xs uppercase tracking-[0.24em] text-on-surface-variant">
                    {data.jobs.length} roles
                  </span>
                </div>

                <div className="mt-4 space-y-4">
                  {data.jobs.map((job) => (
                    <article
                      key={job.id}
                      className="rounded-[1.5rem] border border-outline-variant bg-surface p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-on-surface">
                            {job.title}
                          </h3>
                          <p className="mt-1 text-sm text-on-surface-variant">
                            {job.location} · {job.requiredQualification}
                          </p>
                        </div>

                        <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-primary">
                          {job.applicationsCount} applicants
                        </span>
                      </div>

                      <p className="mt-4 text-sm leading-7 text-on-surface-variant">
                        {job.description}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {job.requiredSkills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-outline-variant bg-surface-container-low px-3 py-1 text-[11px] font-medium text-on-surface-variant"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-xs uppercase tracking-[0.24em] text-on-surface-variant">
                          Top match score {job.topMatchScore.toFixed(0)}%
                        </span>
                        <button
                          type="button"
                          disabled={applyMutation.isPending}
                          onClick={() => applyMutation.mutate(job.id)}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:border-outline-variant disabled:text-on-surface-variant"
                        >
                          {applyMutation.isPending
                            ? "Applying..."
                            : "Apply now"}
                          <MaterialSymbol icon="send" className="text-[14px]" />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </aside>
          </section>
        ) : null}
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-outline-variant bg-surface p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-on-surface">{value}</p>
    </div>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-outline-variant bg-surface p-4 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-on-surface">{value}</p>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { SiteHeader } from "@/components/sections/home/site-header";
import { useApplyToJobMutation } from "@/services/applications";
import { useCompaniesQuery, useCompanyQuery } from "@/services/companies";

function getCompanyInitials(companyName: string) {
  return companyName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function truncateText(value: string, maxLength = 140) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trimEnd()}...`;
}

export function CompaniesBrowserPage() {
  const [search, setSearch] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null,
  );
  const { data, isLoading, isError, error, refetch } = useCompaniesQuery();

  const companies = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return data ?? [];
    }

    return (data ?? []).filter((company) => {
      return [
        company.companyName,
        company.industry,
        company.location,
        company.summary,
        company.teamFocus,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [data, search]);

  const featuredCompany = companies[0] ?? null;
  const selectedCompanyQuery = useCompanyQuery(selectedCompanyId ?? "");
  const applyMutation = useApplyToJobMutation();

  useEffect(() => {
    if (!selectedCompanyId) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedCompanyId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCompanyId]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(240,168,120,0.18),transparent_28%),linear-gradient(180deg,#faf5ee_0%,#f8f1e7_100%)] text-on-surface">
      <SiteHeader />

      <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          <header className="rounded-[2rem] border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_18px_50px_rgba(58,48,42,0.08)] sm:p-8 lg:p-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">
                  Company directory
                </p>
                <h1 className="text-4xl tracking-tight text-on-surface sm:text-5xl">
                  Approved employers and the openings they are building
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-on-surface-variant sm:text-base">
                  Browse verified employers, keep descriptions concise at a
                  glance, and open a company modal when you want the full hiring
                  story.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/jobs"
                  className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
                >
                  View jobs
                </Link>
                <Link
                  href="/onboarding/job-seeker/dashboard"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground"
                >
                  Open dashboard
                  <MaterialSymbol
                    icon="arrow_forward"
                    className="text-[16px]"
                  />
                </Link>
              </div>
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
                placeholder="Search by name, industry, location, or focus..."
                className="w-full bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant"
              />
            </label>
          </section>

          {isError ? (
            <section className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-6 text-rose-700">
              <p className="font-semibold">Unable to load companies.</p>
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

          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <article
                    key={`company-skeleton-${index}`}
                    className={`animate-pulse rounded-[1.75rem] border border-outline-variant bg-surface ${index === 0 ? "md:col-span-2 xl:row-span-2" : "h-80"}`}
                  />
                ))
              : companies.map((company, index) => {
                  const isFeatured = featuredCompany?.id === company.id;

                  return (
                    <article
                      key={company.id}
                      className={`group overflow-hidden rounded-[1.75rem] border border-outline-variant bg-surface-container-lowest shadow-[0_12px_34px_rgba(58,48,42,0.05)] transition-all hover:-translate-y-1 hover:border-primary/35 ${isFeatured ? "md:col-span-2 xl:row-span-2" : ""}`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedCompanyId(company.id)}
                        className="flex h-full w-full flex-col p-6 text-left"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-primary">
                            {company.logoUrl ? (
                              <Image
                                src={company.logoUrl}
                                alt={company.companyName}
                                width={56}
                                height={56}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-semibold">
                                {getCompanyInitials(company.companyName)}
                              </span>
                            )}
                          </div>

                          <span className="rounded-full border border-outline-variant bg-surface px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-primary">
                            {company.industry}
                          </span>
                        </div>

                        <div className="mt-6 space-y-3">
                          <h2
                            className={`${isFeatured ? "text-3xl" : "text-2xl"} tracking-tight text-on-surface`}
                          >
                            {company.companyName}
                          </h2>
                          <p className="text-sm leading-7 text-on-surface-variant line-clamp-3">
                            {truncateText(
                              company.summary,
                              isFeatured ? 220 : 145,
                            )}
                          </p>
                        </div>

                        <div className="mt-6 grid gap-3 rounded-[1.25rem] border border-outline-variant bg-surface p-4 text-sm text-on-surface-variant sm:grid-cols-2">
                          <div className="flex items-center justify-between gap-3">
                            <span>Location</span>
                            <span className="font-semibold text-on-surface">
                              {company.location}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span>Open jobs</span>
                            <span className="font-semibold text-on-surface">
                              {company.jobsCount}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3 sm:col-span-2">
                            <span>Hiring focus</span>
                            <span className="font-semibold text-on-surface">
                              {company.teamFocus}
                            </span>
                          </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between border-t border-outline-variant pt-4 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                          <span>Open company modal</span>
                          <MaterialSymbol
                            icon="arrow_forward"
                            className="text-[16px] transition-transform group-hover:translate-x-1"
                          />
                        </div>
                      </button>

                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant px-6 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                        <Link href={`/companies/${company.id}`}>View page</Link>
                        <Link href="/jobs">See jobs</Link>
                      </div>
                    </article>
                  );
                })}
          </section>

          {!isLoading && companies.length === 0 ? (
            <section className="rounded-[1.5rem] border border-dashed border-outline-variant bg-surface p-8 text-center text-on-surface-variant">
              No approved companies matched your search.
            </section>
          ) : null}
        </section>
      </main>

      {selectedCompanyId ? (
        <CompanyDetailsModal
          companyId={selectedCompanyId}
          onClose={() => setSelectedCompanyId(null)}
          applyMutation={applyMutation}
          loading={selectedCompanyQuery.isLoading}
          error={selectedCompanyQuery.error}
          data={selectedCompanyQuery.data}
          refetch={selectedCompanyQuery.refetch}
        />
      ) : null}
    </div>
  );
}

function CompanyDetailsModal({
  companyId,
  onClose,
  applyMutation,
  loading,
  error,
  data,
  refetch,
}: {
  companyId: string;
  onClose: () => void;
  applyMutation: ReturnType<typeof useApplyToJobMutation>;
  loading: boolean;
  error: unknown;
  data?: ReturnType<typeof useCompanyQuery>["data"];
  refetch: () => void;
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/30 p-4 sm:p-6 lg:p-12">
      <button
        type="button"
        aria-label="Close company details"
        className="fixed inset-0 cursor-pointer bg-transparent"
        onClick={onClose}
      />

      <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-[2rem] border border-outline-variant bg-surface-container-lowest shadow-[0_24px_60px_rgba(53,38,31,0.22)]">
        <button
          type="button"
          aria-label="Close company details"
          title="Close company details"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full border border-outline-variant bg-surface/95 p-2 text-on-surface transition-colors hover:border-primary hover:text-primary"
        >
          <MaterialSymbol icon="close" className="text-[20px]" />
        </button>

        {loading ? (
          <div className="h-128 animate-pulse bg-surface-container-lowest" />
        ) : error ? (
          <div className="p-8">
            <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-6 text-rose-700">
              <p className="font-semibold">Unable to load company details.</p>
              <p className="mt-2 text-sm">
                {error instanceof Error ? error.message : "Please try again."}
              </p>
              <button
                type="button"
                onClick={refetch}
                className="mt-4 rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold"
              >
                Retry
              </button>
            </div>
          </div>
        ) : data ? (
          <>
            <section className="border-b border-outline-variant bg-surface-container-lowest p-6 md:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex min-w-0 gap-5">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[1.5rem] border border-outline-variant bg-surface text-primary shadow-sm">
                    {data.logoUrl ? (
                      <Image
                        src={data.logoUrl}
                        alt={data.companyName}
                        width={96}
                        height={96}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-semibold">
                        {getCompanyInitials(data.companyName)}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                      {data.industry}
                    </p>
                    <h2 className="mt-2 text-4xl tracking-tight text-on-surface md:text-5xl">
                      {data.companyName}
                    </h2>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-on-surface-variant md:text-base">
                      {truncateText(data.summary, 220)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/companies/${companyId}`}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-outline-variant bg-surface px-5 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
                  >
                    Open page
                  </Link>
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Close
                  </button>
                </div>
              </div>
            </section>

            <div className="grid gap-0 lg:grid-cols-[minmax(0,1.15fr)_360px]">
              <div className="space-y-8 p-6 md:p-8">
                <section>
                  <h3 className="text-2xl tracking-tight text-on-surface">
                    About the company
                  </h3>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-on-surface-variant md:text-base">
                    {truncateText(data.summary, 260)}
                  </p>
                </section>

                <section>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                        Active job openings
                      </p>
                      <h3 className="mt-2 text-3xl tracking-tight text-on-surface">
                        Current roles
                      </h3>
                    </div>
                    <span className="text-xs uppercase tracking-[0.24em] text-on-surface-variant">
                      {data.jobs.length} positions
                    </span>
                  </div>

                  <div className="mt-6 space-y-4">
                    {data.jobs.map((job) => (
                      <article
                        key={job.id}
                        className="rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-5"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h4 className="text-lg font-semibold text-on-surface">
                              {job.title}
                            </h4>
                            <p className="mt-1 text-sm text-on-surface-variant">
                              {job.location} · {job.requiredQualification}
                            </p>
                          </div>
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-primary">
                            {job.applicationsCount} applicants
                          </span>
                        </div>

                        <p className="mt-4 line-clamp-3 text-sm leading-7 text-on-surface-variant">
                          {truncateText(job.description, 180)}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {job.requiredSkills.slice(0, 5).map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full border border-outline-variant bg-surface px-3 py-1 text-[11px] text-on-surface-variant"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant pt-4">
                          <span className="text-xs uppercase tracking-[0.24em] text-on-surface-variant">
                            Top match score {job.topMatchScore.toFixed(0)}%
                          </span>
                          <button
                            type="button"
                            onClick={() => applyMutation.mutate(job.id)}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                          >
                            Apply now
                            <MaterialSymbol
                              icon="send"
                              className="text-[14px]"
                            />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </div>

              <aside className="space-y-4 border-t border-outline-variant bg-surface p-6 md:p-8 lg:border-l lg:border-t-0">
                <section className="rounded-[1.75rem] border border-outline-variant bg-surface-container-low p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                    Benefits
                  </p>
                  <div className="mt-5 space-y-4">
                    <Benefit
                      label="Remote flexibility"
                      copy="Blend office and remote work to match the hiring style."
                    />
                    <Benefit
                      label="Talent growth"
                      copy="Strong teams, clear progression, and visible career movement."
                    />
                    <Benefit
                      label="Practical support"
                      copy="Hiring teams that value direct communication and quick decisions."
                    />
                  </div>
                </section>

                <section className="rounded-[1.75rem] border border-outline-variant bg-surface p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                    Quick facts
                  </p>
                  <div className="mt-4 space-y-4 text-sm text-on-surface-variant">
                    <Fact label="Industry" value={data.industry} />
                    <Fact label="Location" value={data.location} />
                    <Fact label="Open roles" value={String(data.jobs.length)} />
                    <Fact label="Focus" value={data.teamFocus} />
                  </div>
                </section>

                <section className="rounded-[1.75rem] border border-outline-variant bg-surface-container-low p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                    Actions
                  </p>
                  <div className="mt-4 space-y-3">
                    <Link
                      href={`/companies/${companyId}`}
                      className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-outline-variant bg-surface px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
                    >
                      View company page
                    </Link>
                    <Link
                      href="/jobs"
                      className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground"
                    >
                      Explore jobs
                    </Link>
                  </div>
                </section>
              </aside>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function Benefit({ label, copy }: { label: string; copy: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <MaterialSymbol icon="star" className="text-[16px]" />
      </div>
      <div>
        <p className="text-sm font-semibold text-on-surface">{label}</p>
        <p className="mt-1 text-xs leading-6 text-on-surface-variant">{copy}</p>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-on-surface-variant">
        {label}
      </p>
      <p className="mt-1 text-sm text-on-surface">{value}</p>
    </div>
  );
}

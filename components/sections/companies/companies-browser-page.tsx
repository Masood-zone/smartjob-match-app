"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { SiteHeader } from "@/components/sections/home/site-header";
import { useApplyToJobMutation } from "@/services/applications";
import { useCompaniesQuery, useCompanyQuery } from "@/services/companies";

function getCompanyInitial(companyName: string) {
  return companyName.trim().charAt(0).toUpperCase() || "Q";
}

function truncateText(value: string, maxLength = 140) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trimEnd()}...`;
}

function CompanyLogo({ companyName }: { companyName: string }) {
  return (
    <span className="text-2xl font-semibold text-primary">
      {getCompanyInitial(companyName)}
    </span>
  );
}

export function CompaniesBrowserPage() {
  const [search, setSearch] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null,
  );
  const { data, isLoading, isError, error, refetch } = useCompaniesQuery();

  const companies = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const source = data ?? [];

    if (!normalizedSearch) {
      return source;
    }

    return source.filter((company) => {
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
    <div className="min-h-screen bg-background text-on-surface">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <section className="mb-16 text-center md:text-left">
          <h1 className="font-headline text-5xl leading-tight text-on-surface md:text-7xl">
            Companies <span className="italic text-primary">—</span> Qualify
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-light leading-relaxed text-on-surface-variant">
            Discover curated organizations shaping the future. Our directory
            showcases companies defined by purpose, innovation, and resilience.
          </p>
        </section>

        <section className="mb-12 rounded-xl bg-surface-container-low p-4 shadow-[0_2px_16px_rgba(58,48,42,0.02)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <label className="relative flex w-full items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3">
              <MaterialSymbol
                icon="search"
                className="text-[22px] text-outline"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, industry, location, or focus..."
                className="w-full bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant"
              />
            </label>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-on-primary transition-opacity hover:opacity-90 md:w-auto"
            >
              <MaterialSymbol icon="filter_list" className="text-[18px]" />
              Filter
            </button>
          </div>
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

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <article
                  key={`company-skeleton-${index}`}
                  className={`animate-pulse rounded-[1.5rem] border border-[#e7ddd3] bg-[#fdfbf8] ${index === 1 ? "lg:col-span-2 lg:row-span-2 min-h-[34rem]" : "min-h-[28rem]"}`}
                />
              ))
            : companies.map((company, index) => {
                const isFeatured = index === 1;

                return (
                  <article
                    key={company.id}
                    className={`group relative overflow-hidden rounded-[1.5rem] border border-[#e7ddd3] bg-[#fdfbf8] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${isFeatured ? "lg:col-span-2 lg:row-span-2" : ""}`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedCompanyId(company.id)}
                      className={`flex h-full min-h-[28rem] w-full flex-col text-left hover:cursor-pointer ${isFeatured ? "p-10 lg:min-h-[36rem]" : "p-8"}`}
                    >
                      <div className="mb-8 flex items-start justify-between">
                        <div
                          className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f4e4d8] text-[#c66b2d] ${isFeatured ? "h-[4.5rem] w-[4.5rem]" : ""}`}
                        >
                          <CompanyLogo companyName={company.companyName} />
                        </div>

                        <span className="rounded-full bg-[#f4e4d8] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[#c66b2d]">
                          {company.industry}
                        </span>
                      </div>

                      <div className="space-y-4">
                        <h2 className="font-headline text-[1.9rem] tracking-tight text-[#2f261f] transition-colors group-hover:text-[#c66b2d]">
                          {company.companyName}
                        </h2>
                        <p className="max-w-[42rem] text-[0.98rem] leading-8 text-[#7d7268]">
                          {truncateText(
                            company.summary,
                            isFeatured ? 190 : 155,
                          )}
                        </p>
                      </div>

                      {isFeatured ? (
                        <div className="mt-8 overflow-hidden rounded-2xl border border-[#e7ddd3] bg-[#f4e4d8]">
                          <div className="relative h-[220px] w-full overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#f4e4d8] via-[#fbf5ee] to-[#fdfbf8]" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="rounded-full border border-[#e7ddd3] bg-white/70 px-6 py-4 text-center">
                                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#c66b2d]">
                                  Featured company
                                </p>
                                <p className="mt-2 text-sm text-[#7d7268]">
                                  {company.location}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      <div className="mt-8 border-t border-[#e7ddd3] pt-5">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-base uppercase tracking-[0.24em] text-primary/85">
                            Details
                          </span>

                          <div className="flex items-center gap-3 text-sm text-[#7d7268]">
                            <MaterialSymbol
                              icon="arrow_forward"
                              className="text-[18px] text-[#c66b2d] transition-transform duration-200 group-hover:translate-x-1"
                            />
                          </div>
                        </div>
                      </div>
                    </button>
                  </article>
                );
              })}
        </section>

        {!isLoading && companies.length === 0 ? (
          <section className="rounded-[1.5rem] border border-dashed border-outline-variant bg-surface p-8 text-center text-on-surface-variant">
            No approved companies matched your search.
          </section>
        ) : null}
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background p-4 sm:p-6 lg:p-12">
      <button
        type="button"
        aria-label="Close company details"
        className="fixed inset-0 cursor-pointer bg-background"
        onClick={onClose}
      />

      <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-[2rem] border border-outline-variant bg-surface-container-lowest shadow-[0_24px_60px_rgba(53,38,31,0.18)]">
        <button
          type="button"
          aria-label="Close company details"
          title="Close company details"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full border border-outline-variant bg-surface p-2 text-on-surface transition-colors hover:border-primary hover:text-primary"
        >
          <MaterialSymbol icon="close" className="text-[20px]" />
        </button>

        {loading ? (
          <div className="flex min-h-[32rem] items-center justify-center bg-surface-container-lowest px-6 py-16 text-center">
            <div className="space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-outline-variant bg-surface text-primary shadow-sm">
                <MaterialSymbol
                  icon="autorenew"
                  className="text-[24px] animate-spin"
                />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
                  Loading details
                </p>
                <p className="mt-2 text-sm text-on-surface-variant">
                  Fetching company information...
                </p>
              </div>
            </div>
          </div>
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
                  <div className="flex h-24 w-24 items-center justify-center rounded-[1.5rem] border border-primary/10 bg-primary-fixed text-primary shadow-sm">
                    <span className="text-3xl font-semibold">
                      {getCompanyInitial(data.companyName)}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                      {data.industry}
                    </p>
                    <h2 className="mt-2 font-headline text-4xl tracking-tight text-on-surface md:text-5xl">
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
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-on-primary transition-colors hover:bg-primary/90"
                  >
                    Close
                  </button>
                </div>
              </div>
            </section>

            <div className="grid gap-0 lg:grid-cols-[minmax(0,1.15fr)_360px]">
              <div className="space-y-8 p-6 md:p-8">
                <section>
                  <h3 className="font-headline text-2xl tracking-tight text-on-surface md:text-3xl">
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
                      <h3 className="mt-2 font-headline text-3xl tracking-tight text-on-surface">
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
                            <h4 className="font-headline text-lg text-on-surface">
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
                            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary transition-colors hover:bg-primary hover:text-on-primary"
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
                      className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-on-primary"
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

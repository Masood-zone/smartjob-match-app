"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { useCompaniesQuery } from "@/services/companies";

function getCompanyInitials(companyName: string) {
  return companyName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function CompaniesPage() {
  const [search, setSearch] = useState("");
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

  return (
    <main className="flex-1 bg-[radial-gradient(circle_at_top_right,rgba(240,168,120,0.18),transparent_28%),linear-gradient(180deg,#faf5ee_0%,#f8f1e7_100%)] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="mx-auto max-w-7xl space-y-8">
        <header className="overflow-hidden rounded-[2rem] border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_18px_50px_rgba(58,48,42,0.08)] sm:p-8 lg:p-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">
                Company directory
              </p>
              <h1 className="text-4xl tracking-tight text-on-surface sm:text-5xl">
                Approved employers ready for matching
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-on-surface-variant sm:text-base">
                Browse verified companies, inspect current openings, and jump
                into roles that align with your qualifications and skills.
              </p>
            </div>

            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
            >
              View all jobs
              <MaterialSymbol icon="arrow_forward" className="text-[16px]" />
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
              placeholder="Search by company name, industry, location, or focus..."
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

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <article
                  key={`company-skeleton-${index}`}
                  className="h-80 animate-pulse rounded-[1.75rem] border border-outline-variant bg-surface"
                />
              ))
            : companies.map((company) => (
                <Link
                  key={company.id}
                  href={`/companies/${company.id}`}
                  className="group flex h-full flex-col rounded-[1.75rem] border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] transition-all hover:-translate-y-1 hover:border-primary/35"
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

                  <h2 className="mt-6 text-2xl tracking-tight text-on-surface">
                    {company.companyName}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                    {company.summary}
                  </p>

                  <div className="mt-6 space-y-3 rounded-[1.25rem] border border-outline-variant bg-surface p-4 text-sm text-on-surface-variant">
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
                    <div className="flex items-center justify-between gap-3">
                      <span>Hiring focus</span>
                      <span className="font-semibold text-on-surface">
                        {company.teamFocus}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-outline-variant pt-4 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                    <span>View details</span>
                    <MaterialSymbol
                      icon="arrow_forward"
                      className="text-[16px] transition-transform group-hover:translate-x-1"
                    />
                  </div>
                </Link>
              ))}
        </section>

        {!isLoading && companies.length === 0 ? (
          <section className="rounded-[1.5rem] border border-dashed border-outline-variant bg-surface p-8 text-center text-on-surface-variant">
            No approved companies matched your search.
          </section>
        ) : null}
      </section>
    </main>
  );
}

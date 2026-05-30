"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { SiteHeader } from "@/components/sections/home/site-header";
import { useApplyToJobMutation } from "@/services/applications";
import { useJobsQuery } from "@/services/jobs";

const INDUSTRY_FILTERS = ["Technology", "Creative", "Finance", "Operations"];
const EXPERIENCE_FILTERS = [
  { label: "Entry Level", value: "ENTRY" },
  { label: "Mid Level", value: "MID" },
  { label: "Senior Level", value: "SENIOR" },
];

function getCompanyInitials(companyName: string) {
  return companyName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// function matchesIndustry(jobIndustry: string, filters: string[]) {
//   if (filters.length === 0) {
//     return true;
//   }

//   const normalizedIndustry = jobIndustry.toLowerCase();
//   const keywordMap: Record<string, string[]> = {
//     Technology: ["tech", "software", "data", "it", "digital"],
//     Creative: ["creative", "design", "media", "marketing", "brand"],
//     Finance: ["finance", "fintech", "bank", "capital", "investment"],
//     Operations: [
//       "operations",
//       "logistics",
//       "supply",
//       "manufacturing",
//       "construction",
//     ],
//   };

//   return filters.some((filter) => {
//     const keywords = keywordMap[filter] ?? [];

//     return (
//       normalizedIndustry.includes(filter.toLowerCase()) ||
//       keywords.some((keyword) => normalizedIndustry.includes(keyword))
//     );
//   });
// }

export function JobsBrowserPage() {
  const [search, setSearch] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [applicationSentJobId, setApplicationSentJobId] = useState<
    string | null
  >(null);

  const { data, isLoading, isError, error, refetch } = useJobsQuery({
    query: search,
    industry: selectedIndustries.join(","),
    experience: selectedExperience,
  });
  const applyMutation = useApplyToJobMutation();

  const jobs = useMemo(() => data ?? [], [data]);
  const pageSize = 4;
  const employerCount = useMemo(
    () => new Set(jobs.map((job) => job.companyName)).size,
    [jobs],
  );

  useEffect(() => {
    if (!applicationSentJobId) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setApplicationSentJobId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [applicationSentJobId]);

  const totalPages = Math.max(1, Math.ceil(jobs.length / pageSize));
  // const visibleJobs = jobs.slice(
  //   pageIndex * pageSize,
  //   pageIndex * pageSize + pageSize,
  // );

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <section className="mb-16 text-center md:text-left">
          <h1 className="font-headline text-5xl leading-tight text-on-surface md:text-7xl">
            Your next chapter, <br />
            <span className="italic text-primary">curated with intent.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-light leading-relaxed ">
            Discover roles that align with your expertise and values. Our
            matching engine keeps the filters readable, fast, and tied to the
            underlying job data.
          </p>
        </section>

        <section className="mb-12">
          <div className="flex flex-col gap-4 rounded-xl bg-surface-container-low p-4 shadow-[0_2px_16px_rgba(58,48,42,0.02)] md:flex-row md:items-center">
            <label className="relative w-full">
              <MaterialSymbol
                icon="search"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[22px] text-outline"
              />
              <input
                value={search}
                onChange={(event) => {
                  setPageIndex(0);
                  setSearch(event.target.value);
                }}
                placeholder="Search by title, company, skill, or location..."
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest py-3 pl-12 pr-4 text-sm outline-none transition-all focus:border-primary"
              />
            </label>
            <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-on-primary transition-opacity hover:opacity-90">
              <MaterialSymbol icon="filter_list" className="text-[18px]" />
              Filter
            </button>
          </div>
        </section>

        <section className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          <SummaryCard
            label="Visible jobs"
            value={isLoading ? "—" : String(jobs.length)}
            icon="work"
          />
          <SummaryCard
            label="Verified employers"
            value={isLoading ? "—" : String(employerCount)}
            icon="business"
          />
          <SummaryCard
            label="Quick match focus"
            value="Qualification first"
            icon="auto_awesome"
          />
        </section>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <aside className="space-y-8 lg:col-span-3">
            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.3em] ">
                Categories
              </h3>
              <div className="space-y-3">
                {INDUSTRY_FILTERS.map((industry) => (
                  <label
                    key={industry}
                    className="flex cursor-pointer items-center gap-3 group"
                  >
                    <input
                      checked={selectedIndustries.includes(industry)}
                      onChange={(event) => {
                        setPageIndex(0);
                        setSelectedIndustries((current) =>
                          event.target.checked
                            ? [...current, industry]
                            : current.filter((value) => value !== industry),
                        );
                      }}
                      className="h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary"
                      type="checkbox"
                    />
                    <span className="text-on-surface transition-colors group-hover:text-primary">
                      {industry}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-outline-variant/40 pt-8">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.3em] ">
                Experience
              </h3>
              <div className="space-y-3">
                <label className="flex cursor-pointer items-center gap-3 group">
                  <input
                    checked={selectedExperience === ""}
                    onChange={() => {
                      setPageIndex(0);
                      setSelectedExperience("");
                    }}
                    className="h-5 w-5 border-outline-variant text-primary focus:ring-primary"
                    name="experience"
                    type="radio"
                  />
                  <span className="text-on-surface transition-colors group-hover:text-primary">
                    Any level
                  </span>
                </label>
                {EXPERIENCE_FILTERS.map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-center gap-3 group"
                  >
                    <input
                      checked={selectedExperience === option.value}
                      onChange={() => {
                        setPageIndex(0);
                        setSelectedExperience(option.value);
                      }}
                      className="h-5 w-5 border-outline-variant text-primary focus:ring-primary"
                      name="experience"
                      type="radio"
                    />
                    <span className="text-on-surface transition-colors group-hover:text-primary">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-primary-container/20 p-6">
              <div className="relative z-10">
                <h4 className="mb-2 font-headline text-xl text-on-primary-fixed-variant">
                  Build your career profile
                </h4>
                <p className="mb-4 text-xs ">
                  Let top companies find you through our priority network.
                </p>
                <Link
                  href="/onboarding/job-seeker/dashboard"
                  className="inline-flex items-center gap-2 text-sm font-bold text-primary"
                >
                  Get Started
                  <MaterialSymbol
                    icon="arrow_forward"
                    className="text-[16px]"
                  />
                </Link>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <MaterialSymbol icon="stars" filled className="text-[88px]" />
              </div>
            </div>
          </aside>

          <section className="lg:col-span-9">
            <div className="mb-8 flex items-end justify-between gap-4">
              <p className="font-body ">
                Showing{" "}
                <span className="font-bold text-on-surface">{jobs.length}</span>{" "}
                open opportunities
              </p>
              <div className="flex gap-2">
                <button className="rounded-lg border border-outline-variant p-2 transition-colors hover:bg-surface-container">
                  <MaterialSymbol icon="grid_view" className="text-[20px]" />
                </button>
                <button className="rounded-lg bg-primary p-2 text-on-primary">
                  <MaterialSymbol icon="list" className="text-[20px]" />
                </button>
              </div>
            </div>

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

            <div className="grid grid-cols-1 gap-6">
              {isLoading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <article
                      key={`job-skeleton-${index}`}
                      className="h-72 animate-pulse rounded-2xl border border-outline-variant bg-surface-container-lowest"
                    />
                  ))
                : jobs
                    .slice(
                      pageIndex * pageSize,
                      pageIndex * pageSize + pageSize,
                    )
                    .map((job, index) => (
                      <article
                        key={job.id}
                        className={`group rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-8 shadow-[0_2px_16px_rgba(58,48,42,0.04)] transition-all hover:shadow-xl hover:shadow-primary/5 ${index === 1 ? "lg:row-span-2" : ""}`}
                      >
                        <div className="mb-8 flex items-start justify-between gap-4">
                          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg bg-primary-fixed text-primary">
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
                          <span className="rounded-full bg-tertiary-fixed px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-tertiary">
                            {job.companyIndustry}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-headline text-2xl text-on-surface transition-colors group-hover:text-primary">
                              {job.title}
                            </h3>
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-primary">
                              {job.topMatchScore.toFixed(0)}% match
                            </span>
                          </div>
                          <p className="text-sm font-semibold uppercase tracking-[0.24em] ">
                            {job.companyName}
                          </p>
                          <p className="text-sm leading-relaxed ">
                            {job.description}
                          </p>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-2">
                          {job.requiredSkills.slice(0, 5).map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full border border-outline-variant bg-surface px-3 py-1 text-[11px] font-medium "
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        <div className="mt-6 border-t border-outline-variant pt-6">
                          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm ">
                            <span>{job.location}</span>
                            <span>{job.requiredQualification}</span>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <Link
                              href={`/companies/${job.employerId}`}
                              className="text-sm font-bold text-primary transition-colors hover:text-tertiary"
                            >
                              Company profile
                            </Link>
                            <button
                              type="button"
                              disabled={applyMutation.isPending}
                              onClick={() =>
                                applyMutation.mutate(job.id, {
                                  onSuccess: () =>
                                    setApplicationSentJobId(job.id),
                                })
                              }
                              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Apply now
                              <MaterialSymbol
                                icon="send"
                                className="text-[16px]"
                              />
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
            </div>

            {!isLoading && jobs.length > 0 ? (
              <div className="mt-12 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPageIndex((current) => Math.max(0, current - 1))
                  }
                  disabled={pageIndex === 0}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <MaterialSymbol icon="chevron_left" className="text-[20px]" />
                </button>
                <button className="h-10 w-10 rounded-lg bg-primary font-bold text-on-primary">
                  {pageIndex + 1}
                </button>
                {Array.from({
                  length: Math.min(2, Math.max(totalPages - 1, 0)),
                }).map((_, index) => (
                  <button
                    key={`page-${index}`}
                    type="button"
                    onClick={() => setPageIndex(index + 1)}
                    className="h-10 w-10 rounded-lg border border-outline-variant transition-colors hover:bg-surface-container"
                  >
                    {index + 2}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setPageIndex((current) =>
                      Math.min(totalPages - 1, current + 1),
                    )
                  }
                  disabled={pageIndex >= totalPages - 1}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <MaterialSymbol
                    icon="chevron_right"
                    className="text-[20px]"
                  />
                </button>
              </div>
            ) : null}

            {!isLoading && jobs.length === 0 ? (
              <section className="rounded-[1.5rem] border border-dashed border-outline-variant bg-surface p-8 text-center ">
                No jobs matched your search.
              </section>
            ) : null}
          </section>
        </div>
      </main>

      <footer className="mt-auto border-t border-stone-200 bg-[#faf5ee] dark:border-stone-800 dark:bg-stone-950">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-8 py-12 md:flex-row md:items-center">
          <div className="text-center md:text-left">
            <span className="font-serif text-lg text-stone-800 dark:text-stone-200">
              Qualify
            </span>
            <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
              © 2024 Qualify. Sun-baked simplicity.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-stone-500 dark:text-stone-400">
            <Link
              href="#"
              className="transition-colors hover:text-[#c2652a] hover:underline"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="transition-colors hover:text-[#c2652a] hover:underline"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="transition-colors hover:text-[#c2652a] hover:underline"
            >
              Careers
            </Link>
            <Link
              href="#"
              className="transition-colors hover:text-[#c2652a] hover:underline"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>

      {applicationSentJobId ? (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-on-surface/40 p-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close success modal"
            className="absolute inset-0 cursor-pointer"
            onClick={() => setApplicationSentJobId(null)}
          />
          <div className="relative w-full max-w-md rounded-3xl border border-outline-variant bg-surface p-10 text-center shadow-2xl">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <MaterialSymbol
                icon="check_circle"
                filled
                className="text-[40px] text-primary"
              />
            </div>
            <h2 className="mb-4 text-3xl text-on-surface">Application Sent</h2>
            <p className="mb-8 leading-relaxed ">
              Your application for this role has been submitted. You will get an
              update soon.
            </p>
            <button
              type="button"
              onClick={() => setApplicationSentJobId(null)}
              className="w-full rounded-xl bg-primary py-4 text-lg font-bold text-on-primary transition-colors hover:bg-on-primary-fixed-variant"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SummaryCard({
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
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
            {label}
          </p>
          <p className="mt-3 text-3xl tracking-tight text-on-surface">
            {value}
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <MaterialSymbol icon={icon} className="text-[22px]" />
        </div>
      </div>
    </div>
  );
}

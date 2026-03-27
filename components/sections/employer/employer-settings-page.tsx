"use client";

import Link from "next/link";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { EmployerPortalShell } from "@/components/sections/employer/employer-portal-shell";
import { useSession } from "@/lib/auth-client";
import { useEmployerDashboardQuery } from "@/services/employer/dashboard";

export function EmployerSettingsPage() {
  const { data: session } = useSession();
  const { data, isLoading, isError, error, refetch } =
    useEmployerDashboardQuery();

  return (
    <EmployerPortalShell
      activeSection="settings"
      actionHref="/onboarding/employer/jobs/new"
      actionLabel="Post a Job"
    >
      <div className="bg-[radial-gradient(circle_at_top_right,rgba(240,168,120,0.12),transparent_30%),linear-gradient(180deg,#faf5ee_0%,#f8f1e7_100%)] text-on-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <header className="mb-8 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">
              Settings
            </p>
            <h1 className="text-4xl tracking-tight text-on-surface sm:text-5xl">
              Company and account settings
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-on-surface-variant sm:text-base">
              Review your company profile, jump back into onboarding forms, and
              keep the employer record aligned with what candidates see.
            </p>
          </header>

          {isError ? (
            <section className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-6 text-rose-700">
              <p className="font-semibold">Unable to load settings.</p>
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

          <section className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
            <article className="rounded-[1.75rem] border border-outline-variant bg-surface p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                    Company profile
                  </p>
                  <h2 className="mt-2 text-2xl tracking-tight text-on-surface">
                    Employer identity and visibility
                  </h2>
                </div>
                <MaterialSymbol
                  icon="settings"
                  className="text-[20px] text-primary"
                />
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoCard
                  label="Company name"
                  value={data?.employer.companyName || "Company not set"}
                />
                <InfoCard
                  label="Email"
                  value={
                    data?.employer.companyEmail ||
                    session?.user?.email ||
                    "Unavailable"
                  }
                />
                <InfoCard
                  label="Industry"
                  value={data?.employer.industry || "Unspecified"}
                />
                <InfoCard
                  label="Location"
                  value={data?.employer.location || "Unspecified"}
                />
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-outline-variant bg-surface-container-low p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
                  About the company
                </p>
                <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                  {data?.employer.teamFocus || "Team focus not configured yet."}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/onboarding/employer/basic-info"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground"
                >
                  Edit company profile
                </Link>
                <Link
                  href="/onboarding/employer/verification"
                  className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant"
                >
                  Verification docs
                </Link>
              </div>
            </article>

            <div className="space-y-6">
              <article className="rounded-[1.75rem] border border-outline-variant bg-surface-container-low p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                  Account snapshot
                </p>
                <div className="mt-5 flex items-center gap-4 rounded-[1.35rem] border border-outline-variant bg-surface p-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <MaterialSymbol
                      icon="account_circle"
                      className="text-[24px]"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-on-surface">
                      {session?.user?.name || "Recruiter account"}
                    </h3>
                    <p className="text-sm text-on-surface-variant">
                      {session?.user?.email || "No email available"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <InfoCard
                    label="Verification"
                    value={data?.employer.verificationStatus || "PENDING"}
                  />
                  <InfoCard
                    label="Onboarding"
                    value={data?.employer.onboardingStatus || "IN_PROGRESS"}
                  />
                </div>
              </article>

              <article className="rounded-[1.75rem] border border-outline-variant bg-surface p-6 shadow-[0_12px_34px_rgba(58,48,42,0.05)] sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                  Quick links
                </p>
                <div className="mt-5 space-y-3">
                  <ActionLink
                    href="/onboarding/employer/team-setup"
                    label="Update team setup"
                  />
                  <ActionLink
                    href="/onboarding/employer/jobs/new"
                    label="Create a new job"
                  />
                  <ActionLink
                    href="/onboarding/employer/applicants"
                    label="Review applicants"
                  />
                  <ActionLink
                    href="/onboarding/employer/analytics"
                    label="View analytics"
                  />
                </div>
              </article>
            </div>
          </section>
        </div>
      </div>
    </EmployerPortalShell>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-outline-variant bg-surface p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-on-surface">{value}</p>
    </div>
  );
}

function ActionLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-outline-variant bg-surface-container-lowest px-4 py-4 text-sm text-on-surface transition-colors hover:border-primary hover:text-primary"
    >
      <span>{label}</span>
      <MaterialSymbol icon="arrow_forward" className="text-[18px]" />
    </Link>
  );
}

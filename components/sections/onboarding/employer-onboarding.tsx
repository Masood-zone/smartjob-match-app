import Link from "next/link";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";

export function EmployerOnboarding() {
  return (
    <main className="flex-1 px-6 py-16 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-start">
        <section className="space-y-6 rounded-[1.75rem] border border-outline-variant bg-surface-container-lowest p-8 shadow-[0_20px_60px_rgba(58,48,42,0.08)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-low px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            Employer onboarding
          </div>
          <h1 className="max-w-2xl text-4xl tracking-tight text-on-surface lg:text-5xl">
            Set up your hiring side with a structure that is ready for the
            Employer model.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-on-surface-variant sm:text-lg">
            The employer path will be expanded after the job seeker flow, but
            this screen already gives the route a polished destination and keeps
            the data shape consistent for future API work.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <InfoTile
              icon="domain"
              title="Company profile"
              copy="Company name and employer identity map directly to the Employer model."
            />
            <InfoTile
              icon="badge"
              title="Role upgrade"
              copy="The app already supports the EMPLOYER role in the schema."
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Register as employer
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-outline-variant px-6 py-3 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low"
            >
              Login
            </Link>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-outline-variant bg-primary/5 p-6 shadow-[0_20px_60px_rgba(58,48,42,0.06)]">
          <div className="rounded-[1.5rem] border border-primary/10 bg-surface-container-lowest p-6">
            <div className="flex items-center gap-3 text-primary">
              <MaterialSymbol icon="work_outline" className="text-[22px]" />
              <p className="text-xs font-semibold uppercase tracking-[0.28em]">
                Employer path preview
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-outline-variant bg-surface p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-on-surface-variant">
                  Company name
                </p>
                <p className="mt-2 text-sm text-on-surface-variant">
                  Your organization or hiring entity.
                </p>
              </div>
              <div className="rounded-2xl border border-outline-variant bg-surface p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-on-surface-variant">
                  Hiring focus
                </p>
                <p className="mt-2 text-sm text-on-surface-variant">
                  Roles, departments, and team growth needs.
                </p>
              </div>
              <div className="rounded-2xl border border-outline-variant bg-surface p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-on-surface-variant">
                  Next step
                </p>
                <p className="mt-2 text-sm text-on-surface-variant">
                  We will later connect this route to the employer dashboard and
                  job-posting flow.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function InfoTile({
  icon,
  title,
  copy,
}: {
  icon: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-5">
      <div className="flex items-center gap-3 text-primary">
        <MaterialSymbol icon={icon} className="text-[20px]" />
        <h2 className="text-base font-semibold text-on-surface">{title}</h2>
      </div>
      <p className="mt-3 text-sm leading-6 text-on-surface-variant">{copy}</p>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { useSession } from "@/lib/auth-client";

const overviewCards = [
  {
    label: "Onboarding status",
    value: "Pending review",
    meta: "Document and team setup captured",
    icon: "hourglass_top",
  },
  {
    label: "Current workers",
    value: "5",
    meta: "Company headcount",
    icon: "groups",
  },
  {
    label: "Planned hires",
    value: "3",
    meta: "Open growth plan",
    icon: "person_add",
  },
] as const;

const nextSteps = [
  "Verification team reviews the business registration document.",
  "Employer profile stays accessible for future edits and job posting setup.",
  "You can return to onboarding if any detail needs to be corrected.",
];

export function EmployerDashboard() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(240,168,120,0.18),transparent_28%),linear-gradient(180deg,#faf5ee_0%,#f8f1e7_100%)] text-on-background">
      <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-outline-variant/60 bg-surface-container-lowest/92 py-6 backdrop-blur md:flex">
        <div className="px-6 mb-8">
          <h1 className="text-xl font-serif font-black text-primary">
            Qualify
          </h1>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-on-surface-variant">
            Employer dashboard
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-2">
          {[
            ["Dashboard", "dashboard", true, "/onboarding/employer/dashboard"],
            ["Onboarding", "route", false, "/onboarding"],
            ["Verification", "verified", false, "#verification"],
            ["Help", "help", false, "/resources"],
          ].map(([label, icon, active, href]) => (
            <Link
              key={String(label)}
              href={String(href)}
              className={`mx-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${active ? "bg-primary/10 text-primary" : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"}`}
            >
              <MaterialSymbol icon={String(icon)} className="text-[18px]" />
              <span>{String(label)}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-outline-variant/60 pt-4 space-y-1">
          <Link
            className="mx-2 flex items-center gap-3 rounded-xl px-4 py-2 text-xs uppercase tracking-widest text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
            href="/resources"
          >
            <MaterialSymbol icon="help" className="text-[16px]" />
            Support Center
          </Link>
        </div>
      </aside>

      <div className="md:ml-64 flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 border-b border-outline-variant/60 bg-surface-container-lowest/92 backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div>
              <h2 className="text-2xl font-serif font-bold tracking-tight text-primary md:hidden">
                Qualify
              </h2>
              <div className="hidden md:block">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-on-surface-variant">
                  Dashboard
                </p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Welcome back{user?.name ? `, ${user.name}` : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-surface text-on-surface-variant transition-colors hover:border-primary hover:text-primary">
                <MaterialSymbol icon="notifications" className="text-[18px]" />
              </button>
              <div className="flex items-center gap-3 border-l border-outline-variant pl-3">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-primary bg-primary/10 text-xs font-semibold text-primary">
                  {user?.image ? (
                    <Image
                      src={user.image}
                      alt={user.name ? `${user.name} avatar` : "User avatar"}
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{user?.name ? user.name[0] : "U"}</span>
                  )}
                </div>
                <div className="hidden min-w-0 sm:block">
                  <p className="truncate text-sm font-semibold text-on-surface">
                    {user?.name || "Employer"}
                  </p>
                  <p className="truncate text-xs text-on-surface-variant">
                    {user?.email || "account@qualify.app"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 space-y-10 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <section className="grid gap-6 md:grid-cols-3">
            {overviewCards.map((card) => (
              <article
                key={card.label}
                className="rounded-[1.5rem] border border-outline-variant/70 bg-surface-container-low p-6 shadow-[0_8px_30px_rgba(58,48,42,0.04)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-on-surface-variant">
                      {card.label}
                    </p>
                    <h3 className="mt-2 text-4xl font-serif font-bold text-on-surface">
                      {card.value}
                    </h3>
                  </div>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <MaterialSymbol icon={card.icon} className="text-[20px]" />
                  </span>
                </div>
                <p className="mt-4 text-sm text-primary">{card.meta}</p>
              </article>
            ))}
          </section>

          <section
            className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]"
            id="verification"
          >
            <article className="rounded-[1.75rem] border border-outline-variant/70 bg-surface-container-low p-6 shadow-[0_8px_30px_rgba(58,48,42,0.04)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-on-surface">
                    Employer onboarding
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                    Your company record is saved and ready for review. Return to
                    onboarding at any time to update details or continue setup.
                  </p>
                </div>
                <Link
                  href="/onboarding/employer"
                  className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
                >
                  Open onboarding
                  <MaterialSymbol
                    icon="arrow_forward"
                    className="text-[16px]"
                  />
                </Link>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <InfoCard
                  icon="verified"
                  title="Verification"
                  copy="The business registration upload is attached to your onboarding draft."
                />
                <InfoCard
                  icon="groups"
                  title="Hiring setup"
                  copy="Team size and planned hires are captured for later dashboard use."
                />
              </div>

              <div className="mt-6 space-y-3 rounded-[1.5rem] border border-outline-variant bg-surface p-5">
                {nextSteps.map((step) => (
                  <div key={step} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <MaterialSymbol icon="done" className="text-[16px]" />
                    </span>
                    <p className="text-sm leading-6 text-on-surface-variant">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </article>

            <aside className="rounded-[1.75rem] border border-outline-variant/70 bg-primary/5 p-6 shadow-[0_8px_30px_rgba(58,48,42,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                Employer profile
              </p>
              <div className="mt-4 rounded-[1.5rem] border border-outline-variant bg-surface-container-lowest p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <MaterialSymbol icon="business" className="text-[22px]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      {user?.name || "Employer account"}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {user?.email || "account@qualify.app"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-sm text-on-surface-variant">
                  <div className="flex items-center justify-between gap-4">
                    <span>Dashboard path</span>
                    <span className="font-semibold text-on-surface">
                      /onboarding/employer/dashboard
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Status</span>
                    <span className="font-semibold text-primary">
                      Review queued
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-outline-variant bg-surface-container-lowest p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
                  Next action
                </p>
                <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                  Use the onboarding hub to continue any unfinished employer
                  setup or switch to the job seeker track.
                </p>
              </div>
            </aside>
          </section>
        </main>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  copy,
}: {
  icon: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="rounded-[1.25rem] border border-outline-variant bg-surface p-5">
      <div className="flex items-center gap-3 text-primary">
        <MaterialSymbol icon={icon} className="text-[20px]" />
        <h3 className="text-base font-semibold text-on-surface">{title}</h3>
      </div>
      <p className="mt-3 text-sm leading-6 text-on-surface-variant">{copy}</p>
    </div>
  );
}

"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { useSession } from "@/lib/auth-client";

import { employerFlowSteps, getEmployerStepIndex } from "./employer-flow";
import { AvatarBadge, ProgressSidebar } from "./employer-ui";

type SessionUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export function MarketingFrame({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const user = session?.user as SessionUser | undefined;

  return (
    <div className="min-h-screen bg-[#faf5ee] text-on-surface">
      <header className="sticky top-0 z-50 border-b border-[#d8d0c8]/60 bg-[#faf5ee]/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/onboarding"
            className="font-serif text-2xl font-bold italic tracking-tight text-primary"
          >
            Qualify
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-stone-500 transition-colors hover:text-primary"
              aria-label="Help"
            >
              <MaterialSymbol icon="help_outline" className="text-[18px]" />
            </button>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-stone-500 transition-colors hover:text-primary"
              aria-label="Security"
            >
              <MaterialSymbol icon="lock" className="text-[18px]" />
            </button>
            <AvatarBadge user={user} />
          </div>
        </div>
      </header>

      {children}

      <footer className="mx-auto flex w-full max-w-7xl flex-col gap-4 border-t border-outline-variant/30 px-6 py-12 text-xs font-medium text-on-surface-variant/60 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <MaterialSymbol icon="verified" className="text-[14px]" />
          <span>Secured Verification Process</span>
        </div>
        <div className="flex flex-wrap gap-8">
          <a href="#" className="transition-colors hover:text-primary">
            Privacy Policy
          </a>
          <a href="#" className="transition-colors hover:text-primary">
            Terms of Service
          </a>
          <a href="#" className="transition-colors hover:text-primary">
            Support Center
          </a>
        </div>
      </footer>
    </div>
  );
}

export function OnboardingFrame({
  currentStepKey,
  children,
  aside,
}: {
  currentStepKey: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  const { data: session } = useSession();
  const user = session?.user as SessionUser | undefined;
  const currentStepIndex = Math.max(
    getEmployerStepIndex(currentStepKey as never),
    0,
  );

  return (
    <div className="min-h-screen bg-[#faf5ee] text-on-surface">
      <header className="sticky top-0 z-50 border-b border-[#d8d0c8]/60 bg-[#faf5ee]/92 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link
              href="/onboarding"
              className="font-serif text-2xl font-bold italic tracking-tight text-primary"
            >
              Qualify
            </Link>

            <nav className="hidden items-center gap-6 lg:flex">
              {employerFlowSteps.slice(1, 5).map((step) => (
                <Link
                  key={step.key}
                  href={step.href}
                  className={cnNav(step.key === currentStepKey)}
                >
                  {step.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-stone-500 transition-colors hover:text-primary"
              aria-label="Help"
            >
              <MaterialSymbol icon="help_outline" className="text-[18px]" />
            </button>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-stone-500 transition-colors hover:text-primary"
              aria-label="Security"
            >
              <MaterialSymbol icon="lock" className="text-[18px]" />
            </button>
            <AvatarBadge user={user} />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[240px_minmax(0,1fr)_320px] lg:px-8 lg:py-10">
        <ProgressSidebar currentStepKey={currentStepKey} />

        <section className="space-y-6">
          <div className="rounded-[1.25rem] border border-[#d8d0c8]/60 bg-surface-container-lowest px-5 py-4 shadow-[0_2px_16px_rgba(58,48,42,0.04)] lg:hidden">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
                  Employer onboarding
                </p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Step {currentStepIndex + 1} of 5
                </p>
              </div>
              <div className="w-36 overflow-hidden rounded-full bg-surface-container-highest">
                <div
                  className="h-1.5 rounded-full bg-primary transition-all"
                  style={{ width: `${((currentStepIndex + 1) / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {children}
        </section>

        <aside className="hidden lg:block">{aside}</aside>
      </div>
    </div>
  );
}

function cnNav(active: boolean) {
  return `border-b-2 pb-1 text-sm font-medium transition-colors ${active ? "border-primary font-semibold text-primary" : "border-transparent text-stone-500 hover:text-primary"}`;
}

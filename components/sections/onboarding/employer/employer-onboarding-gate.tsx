"use client";

import type { ReactNode } from "react";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { AccessPromptDialog } from "@/components/sections/auth/access-prompt-dialog";
import { useSession } from "@/lib/auth-client";

function Spinner() {
  return (
    <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
  );
}

export function EmployerOnboardingGate({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-4 py-16">
        <div className="flex items-center gap-3 rounded-full border border-outline-variant bg-surface-container-lowest px-5 py-3 text-sm text-on-surface-variant shadow-sm">
          <Spinner />
          Checking your account
        </div>
      </main>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-[70vh] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto flex max-w-2xl items-center justify-center">
          <div className="pointer-events-none fixed inset-0 bg-background/60 backdrop-blur-[2px]" />
          <div className="relative z-10 w-full max-w-2xl rounded-[1.75rem] border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_24px_70px_rgba(58,48,42,0.14)] sm:p-8">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MaterialSymbol icon="lock" className="text-[24px]" />
            </div>
            <h1 className="text-3xl tracking-tight text-on-surface sm:text-4xl">
              Sign in before starting employer onboarding
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-on-surface-variant">
              Employer onboarding saves your company details, document uploads,
              and team setup progress so you can return later and continue.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <a
                href="/register"
                className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-outline-variant px-5 py-3 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low"
              >
                Create account
              </a>
              <a
                href="/login"
                className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_16px_34px_rgba(194,101,42,0.22)] transition-colors hover:bg-primary/90"
              >
                Log in
              </a>
            </div>
          </div>
        </div>

        <AccessPromptDialog
          open
          onOpenChange={() => undefined}
          title="You need an account first"
          description="Register or log in before you can continue into the employer onboarding flow."
          loginHref="/login"
          registerHref="/register"
        />
      </div>
    );
  }

  return <>{children}</>;
}

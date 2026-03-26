"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { employerRoutes } from "@/components/sections/onboarding/employer/employer-flow";
import { useSession } from "@/lib/auth-client";

export default function EmployerSuccessPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      router.replace(employerRoutes.dashboard);
      router.refresh();
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(194,101,42,0.16),transparent_30%),linear-gradient(180deg,#faf5ee_0%,#f7efe4_100%)] px-4 py-10 text-on-surface">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_30px_80px_rgba(58,48,42,0.14)] sm:p-8">
        <div className="absolute right-0 top-0 h-40 w-40 translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MaterialSymbol icon="verified" className="text-[28px]" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Submission complete
            </p>
            <h1 className="mt-2 text-3xl tracking-tight text-on-surface sm:text-4xl">
              Your employer profile is under review
            </h1>
          </div>
        </div>

        <p className="relative mt-5 max-w-xl text-sm leading-7 text-on-surface-variant sm:text-base">
          Thanks {user?.name || "for submitting"}. Your company details and
          registration document have been saved. We will move you into the
          employer dashboard once the final check completes.
        </p>

        <div className="relative mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[1.25rem] border border-outline-variant bg-surface p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-on-surface-variant">
              Status
            </p>
            <p className="mt-2 text-sm font-semibold text-on-surface">
              Verification queued
            </p>
          </div>
          <div className="rounded-[1.25rem] border border-outline-variant bg-surface p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-on-surface-variant">
              Next destination
            </p>
            <p className="mt-2 text-sm font-semibold text-on-surface">
              Employer dashboard
            </p>
          </div>
          <div className="rounded-[1.25rem] border border-outline-variant bg-surface p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-on-surface-variant">
              Auto redirect
            </p>
            <p className="mt-2 text-sm font-semibold text-on-surface">
              In a few seconds
            </p>
          </div>
        </div>

        <div className="relative mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={employerRoutes.dashboard}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go to dashboard now
            <MaterialSymbol icon="arrow_forward" className="text-[18px]" />
          </Link>
          <Link
            href={employerRoutes.basicInfo}
            className="inline-flex items-center justify-center rounded-full border border-outline-variant px-6 py-3 text-sm font-semibold text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
          >
            Review profile details
          </Link>
        </div>

        <p className="relative mt-6 text-xs uppercase tracking-[0.28em] text-on-surface-variant/60">
          Signed in as {user?.email || "your account"}
        </p>
      </div>
    </main>
  );
}

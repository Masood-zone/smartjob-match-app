"use client";

import Image from "next/image";
import Link from "next/link";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CompletionUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export function OnboardingCompleteDialog({
  open,
  onOpenChange,
  user,
  qualification,
  skillsCount,
  dashboardHref = "/onboarding/job-seeker/dashboard",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: CompletionUser;
  qualification?: string;
  skillsCount: number;
  dashboardHref?: string;
}) {
  const initials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <div className="relative overflow-hidden bg-surface p-6 sm:p-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#c2652a,rgba(240,168,120,0.4),#c2652a)]" />
          <DialogHeader className="text-left">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MaterialSymbol icon="verified" className="text-[24px]" />
            </div>
            <DialogTitle className="mt-4 text-3xl tracking-tight text-on-surface sm:text-4xl">
              Your profile is ready
            </DialogTitle>
            <DialogDescription className="mt-2 max-w-xl text-sm leading-6 text-on-surface-variant">
              Your onboarding details have been saved successfully. We are now
              moving you to your dashboard so you can review matches and track
              your next steps.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
            <div className="rounded-[1.5rem] border border-outline-variant bg-surface-container-low p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
                Account summary
              </p>
              <div className="mt-4 flex items-center gap-4 rounded-[1.25rem] border border-outline-variant bg-surface p-4">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {user?.image ? (
                    <Image
                      src={user.image}
                      alt={user.name ? `${user.name} avatar` : "User avatar"}
                      width={56}
                      height={56}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold text-on-surface">
                    {user?.name || "Signed in user"}
                  </p>
                  <p className="truncate text-sm text-on-surface-variant">
                    {user?.email || "Email not available"}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1rem] border border-outline-variant bg-surface p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-on-surface-variant">
                    Qualification
                  </p>
                  <p className="mt-2 text-sm font-semibold text-on-surface">
                    {qualification || "Captured"}
                  </p>
                </div>
                <div className="rounded-[1rem] border border-outline-variant bg-surface p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-on-surface-variant">
                    Skills
                  </p>
                  <p className="mt-2 text-sm font-semibold text-on-surface">
                    {skillsCount} selected
                  </p>
                </div>
                <div className="rounded-[1rem] border border-outline-variant bg-surface p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-on-surface-variant">
                    Status
                  </p>
                  <p className="mt-2 text-sm font-semibold text-primary">
                    Ready for dashboard
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-outline-variant bg-primary/5 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
                What happens next
              </p>
              <div className="mt-4 space-y-4">
                {[
                  "Dashboard overview with live match summaries",
                  "Recent applications and saved roles",
                  "Profile completion and recommended next actions",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-[1rem] border border-outline-variant bg-surface p-4"
                  >
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <MaterialSymbol icon="done" className="text-[16px]" />
                    </span>
                    <p className="text-sm leading-6 text-on-surface-variant">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6 gap-3 sm:items-center">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-outline-variant px-5 py-3 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low"
            >
              Stay here
            </button>
            <Link
              href={dashboardHref}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_16px_34px_rgba(194,101,42,0.22)] transition-colors hover:bg-primary/90"
            >
              Go to dashboard
              <MaterialSymbol icon="arrow_forward" className="text-[18px]" />
            </Link>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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

function getInitials(name?: string | null) {
  if (!name) {
    return "U";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function EmployerSuccessDialog({
  open,
  onOpenChange,
  user,
  companyName,
  currentTeamSize,
  plannedHires,
  dashboardHref = "/onboarding/employer/dashboard",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: CompletionUser;
  companyName?: string;
  currentTeamSize: number;
  plannedHires: number;
  dashboardHref?: string;
}) {
  const initials = getInitials(user?.name);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0">
        <div className="relative overflow-hidden bg-[#faf5ee] p-6 sm:p-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#c2652a,rgba(240,168,120,0.4),#c2652a)]" />
          <DialogHeader className="text-left">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MaterialSymbol icon="check_circle" className="text-[24px]" />
            </div>
            <DialogTitle className="mt-4 text-3xl tracking-tight text-on-surface sm:text-5xl">
              Application Submitted Successfully
            </DialogTitle>
            <DialogDescription className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant sm:text-lg">
              Your company is under review. Verification typically takes 24-72
              hours. We appreciate your patience while we ensure quality on our
              platform.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,0.95fr)_minmax(280px,1.05fr)]">
            <div className="hidden md:block">
              <div className="relative h-105 overflow-hidden rounded-[2rem] border border-outline-variant bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.72),transparent_28%),linear-gradient(135deg,#f2d7c1_0%,#e9c09c_36%,#b87b4a_100%)] shadow-[0_18px_50px_rgba(58,48,42,0.05)]">
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(58,48,42,0.28))]" />
                <div className="absolute inset-x-6 bottom-6 rounded-[1.25rem] border border-white/50 bg-white/85 p-4 shadow-[0_8px_30px_rgba(58,48,42,0.08)] backdrop-blur">
                  <p className="font-serif text-xl italic text-primary">
                    &quot;The future of work begins with the right
                    foundations.&quot;
                  </p>
                  <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-on-surface-variant">
                    Verification Status: Pending
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
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
                      Company
                    </p>
                    <p className="mt-2 text-sm font-semibold text-on-surface">
                      {companyName || "Captured"}
                    </p>
                  </div>
                  <div className="rounded-[1rem] border border-outline-variant bg-surface p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-on-surface-variant">
                      Team size
                    </p>
                    <p className="mt-2 text-sm font-semibold text-on-surface">
                      {currentTeamSize} workers
                    </p>
                  </div>
                  <div className="rounded-[1rem] border border-outline-variant bg-surface p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-on-surface-variant">
                      Planned hires
                    </p>
                    <p className="mt-2 text-sm font-semibold text-primary">
                      {plannedHires} roles
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
                    "Your company record is queued for verification",
                    "You can revisit the onboarding draft from your dashboard",
                    "Once approved, you can continue into job posting and hiring setup",
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
          </div>

          <DialogFooter className="mt-6 gap-3 sm:items-center">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-outline-variant px-5 py-3 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low"
            >
              Check Email for Updates
            </button>
            <Link
              href={dashboardHref}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_16px_34px_rgba(194,101,42,0.22)] transition-colors hover:bg-primary/90"
            >
              Go to Dashboard
              <MaterialSymbol icon="arrow_forward" className="text-[18px]" />
            </Link>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

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

export function AccessPromptDialog({
  open,
  onOpenChange,
  title,
  description,
  loginHref,
  registerHref,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  loginHref: string;
  registerHref: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0">
        <div className="bg-surface p-6 sm:p-7">
          <DialogHeader className="text-left">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MaterialSymbol icon="lock" className="text-[22px]" />
            </div>
            <DialogTitle className="mt-4 text-2xl tracking-tight text-on-surface sm:text-3xl">
              {title}
            </DialogTitle>
            <DialogDescription className="mt-2 max-w-lg text-sm leading-6 text-on-surface-variant">
              {description}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 grid gap-3 rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-4 text-sm text-on-surface-variant sm:grid-cols-2">
            <div className="rounded-[1rem] border border-outline-variant bg-surface p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
                Why sign in
              </p>
              <p className="mt-2 leading-6">
                Your onboarding progress is tied to your account, so we can save
                each step and return to it later.
              </p>
            </div>
            <div className="rounded-[1rem] border border-outline-variant bg-surface p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
                What happens next
              </p>
              <p className="mt-2 leading-6">
                Log in if you already have an account, or create one and then
                continue straight into onboarding.
              </p>
            </div>
          </div>

          <DialogFooter className="mt-6 gap-3 sm:items-center">
            <Link
              href={registerHref}
              className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-outline-variant px-5 py-3 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low"
            >
              Create account
            </Link>
            <Link
              href={loginHref}
              className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_16px_34px_rgba(194,101,42,0.22)] transition-colors hover:bg-primary/90"
            >
              Log in
            </Link>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

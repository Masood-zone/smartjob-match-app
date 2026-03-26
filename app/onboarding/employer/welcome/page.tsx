"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { MarketingFrame } from "@/components/sections/onboarding/employer/employer-page-frame";
import {
  AvatarBadge,
  FeatureCard,
} from "@/components/sections/onboarding/employer/employer-ui";
import { useSession } from "@/lib/auth-client";

export default function EmployerWelcomePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const user = session?.user;

  return (
    <MarketingFrame>
      <main className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center px-6 py-12 md:py-24">
        <div className="grid w-full max-w-6xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <section className="space-y-10">
            <div className="space-y-4">
              <span className="text-primary font-semibold tracking-[0.28em] text-xs uppercase">
                Employer Portal
              </span>
              <h1 className="max-w-xl font-serif text-5xl leading-[1.1] tracking-tight text-on-surface md:text-7xl">
                Register Your Company on Qualify
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-on-surface-variant md:text-xl">
                Join our network of trusted employers and connect with the most
                qualified talent in your industry. Your progress is saved so you
                can return and continue later.
              </p>
            </div>

            <div className="space-y-6">
              <FeatureCard
                icon="verified"
                title="Verified company badge"
                copy="Build instant trust with candidates through a structured registration flow."
              />
              <FeatureCard
                icon="groups"
                title="Access to qualified candidates"
                copy="Set up the employer side so later hiring tools can match the right people to the right roles."
              />
              <FeatureCard
                icon="speed"
                title="Faster hiring process"
                copy="Reduce time-to-hire by keeping your company profile and verification data in one place."
              />
            </div>

            <div className="flex flex-col gap-4 pt-4 sm:flex-row">
              <button
                type="button"
                onClick={() => router.push("/onboarding/employer/basic-info")}
                className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-primary px-10 py-4 text-sm font-bold text-primary-foreground shadow-[0_12px_28px_rgba(194,101,42,0.24)] transition-all hover:bg-primary/90"
              >
                Start Employer Registration
              </button>
              <Link
                href="/login"
                className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-outline-variant px-8 py-4 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low"
              >
                Already registered? Sign in
              </Link>
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-[1.75rem] border border-outline-variant bg-surface-container-lowest p-5 shadow-[0_18px_50px_rgba(58,48,42,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                Session Preview
              </p>
              <div className="mt-4 flex items-center gap-3 rounded-[1.25rem] border border-outline-variant bg-surface p-4">
                <AvatarBadge
                  user={
                    user
                      ? {
                          name: user.name,
                          email: user.email,
                          image: user.image,
                        }
                      : undefined
                  }
                  sessionPending={isPending}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-on-surface">
                    {user?.name || "Signed in user"}
                  </p>
                  <p className="truncate text-xs text-on-surface-variant">
                    {isPending
                      ? "Loading account..."
                      : user?.email || "No email available"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-outline-variant bg-primary/5 p-5 shadow-[0_18px_50px_rgba(58,48,42,0.05)]">
              <div className="relative h-64 overflow-hidden rounded-[1.5rem] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.72),transparent_28%),linear-gradient(135deg,#f2d7c1_0%,#e9c09c_36%,#b87b4a_100%)]">
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(58,48,42,0.28))]" />
                <div className="absolute bottom-5 left-5 right-5 rounded-[1.25rem] border border-white/50 bg-white/85 p-4 shadow-[0_8px_30px_rgba(58,48,42,0.08)] backdrop-blur">
                  <p className="font-serif text-xl italic text-primary">
                    “The future of work begins with the right foundations.”
                  </p>
                  <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-on-surface-variant">
                    Verification Status: Pending
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-outline-variant bg-surface-container-lowest p-5 shadow-[0_18px_50px_rgba(58,48,42,0.04)]">
              <div className="flex items-center gap-2 text-primary">
                <span className="text-[16px]">★</span>
                <p className="text-xs font-semibold uppercase tracking-[0.28em]">
                  Trust Score
                </p>
              </div>
              <p className="mt-3 font-serif text-2xl italic text-on-surface">
                High Reliability
              </p>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                Your employer profile is structured to build confidence before
                your first role posting.
              </p>
            </div>
          </section>
        </div>
      </main>
    </MarketingFrame>
  );
}

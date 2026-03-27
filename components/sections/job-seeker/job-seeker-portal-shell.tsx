"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { signOut, useSession } from "@/lib/auth-client";

type ActiveSection =
  | "dashboard"
  | "jobs"
  | "matches"
  | "analytics"
  | "settings";

const navItems: Array<{
  label: string;
  href: string;
  icon: string;
  key: ActiveSection;
}> = [
  {
    label: "Dashboard",
    href: "/onboarding/job-seeker/dashboard",
    icon: "dashboard",
    key: "dashboard",
  },
  {
    label: "Jobs",
    href: "/onboarding/job-seeker/dashboard/jobs",
    icon: "work",
    key: "jobs",
  },
  {
    label: "Matches",
    href: "/onboarding/job-seeker/dashboard/matches",
    icon: "auto_awesome",
    key: "matches",
  },
  {
    label: "Analytics",
    href: "/onboarding/job-seeker/dashboard/analytics",
    icon: "trending_up",
    key: "analytics",
  },
  {
    label: "Settings",
    href: "/onboarding/job-seeker/dashboard/settings",
    icon: "settings",
    key: "settings",
  },
];

export function JobSeekerPortalShell({
  activeSection,
  actionHref,
  actionLabel,
  children,
}: {
  activeSection: ActiveSection;
  actionHref?: string;
  actionLabel?: string;
  children: ReactNode;
}) {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = () => {
    void Promise.resolve(signOut()).finally(() => {
      router.replace("/login");
      router.refresh();
    });
  };

  return (
    <div className="min-h-screen bg-[#faf5ee] text-on-surface">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-[#d8d0c8]/60 bg-[#faf5ee] py-6 md:flex">
          <div className="px-6 pb-8">
            <span className="text-xl font-serif font-black text-[#c2652a]">
              Qualify
            </span>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-stone-500">
              Job Seeker Portal
            </p>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const isActive = item.key === activeSection;

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`mx-2 flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 ease-in-out ${isActive ? "bg-[#c2652a]/10 text-[#c2652a]" : "text-stone-500 hover:bg-stone-100 hover:text-[#c2652a]"}`}
                >
                  <MaterialSymbol icon={item.icon} className="text-[18px]" />
                  <span className="text-xs font-medium uppercase tracking-wider">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto px-4 pt-4">
            {actionHref && actionLabel ? (
              <Link
                href={actionHref}
                className="mb-3 inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-xs font-bold uppercase tracking-widest text-on-primary transition-all hover:opacity-90"
              >
                {actionLabel}
              </Link>
            ) : null}

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant px-4 py-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
            >
              <MaterialSymbol icon="logout" className="text-[16px]" />
              Logout
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-50 border-b border-[#d8d0c8]/60 bg-[#faf5ee]/90 shadow-sm backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-6 py-4 md:pl-8 lg:pl-10 lg:pr-8">
              <div className="flex items-center gap-6">
                <span className="text-2xl font-serif font-bold tracking-tight text-[#c2652a] md:hidden">
                  Qualify
                </span>
                <div className="hidden items-center gap-6 lg:flex">
                  <Link
                    href="/jobs"
                    className="text-sm text-stone-600 transition-colors hover:text-[#c2652a]"
                  >
                    Find Jobs
                  </Link>
                  <Link
                    href="/dashboard/job-seeker/companies"
                    className="text-sm text-stone-600 transition-colors hover:text-[#c2652a]"
                  >
                    Companies
                  </Link>
                  <Link
                    href="/resources"
                    className="text-sm text-stone-600 transition-colors hover:text-[#c2652a]"
                  >
                    Resources
                  </Link>
                  <Link
                    href="/onboarding/job-seeker/dashboard/analytics"
                    className="text-sm text-stone-600 transition-colors hover:text-[#c2652a]"
                  >
                    Analytics
                  </Link>
                  <Link
                    href="/onboarding/job-seeker/dashboard/settings"
                    className="text-sm text-stone-600 transition-colors hover:text-[#c2652a]"
                  >
                    Settings
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative hidden sm:block">
                  <input
                    className="w-64 rounded-full border border-outline-variant bg-surface-container-low py-2 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Search matches..."
                    type="text"
                  />
                  <MaterialSymbol
                    icon="search"
                    className="absolute left-3 top-2.5 text-[16px] text-stone-400"
                  />
                </div>

                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-outline-variant bg-surface-container-highest text-primary">
                  {session?.user?.image ? (
                    <Image
                      alt={session.user.name || "Job seeker profile"}
                      src={session.user.image}
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <MaterialSymbol
                      icon="account_circle"
                      className="text-[20px]"
                    />
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}

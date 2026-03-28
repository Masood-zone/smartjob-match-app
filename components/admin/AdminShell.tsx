"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/admin/dashboard", label: "Overview", icon: "dashboard" },
  {
    href: "/admin/job-seekers",
    label: "Job Seeker Verification",
    icon: "how_to_reg",
  },
  {
    href: "/admin/employers",
    label: "Employer Verification",
    icon: "verified_user",
  },
  {
    href: "/admin/algorithm",
    label: "Algorithm Config",
    icon: "settings_input_component",
  },
];

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border/70 bg-[#faf5ee] shadow-[0_2px_16px_rgba(58,48,42,0.04)] lg:flex">
        <div className="p-6">
          <Link href="/admin/dashboard" className="block">
            <h1 className="text-2xl italic text-[#c2652a]">Qualify Smart</h1>
            <p className="mt-1 text-xs uppercase tracking-[0.35em] text-on-surface-variant/70">
              Admin Console
            </p>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-4">
          {navigationItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-r-none border-r-4 px-4 py-3 text-sm transition-all",
                  active
                    ? "border-[#c2652a] bg-[#c2652a]/5 font-semibold text-[#c2652a]"
                    : "border-transparent text-on-surface-variant hover:bg-stone-100/80 hover:text-on-surface",
                )}
              >
                <MaterialSymbol icon={item.icon} className="text-[1.15rem]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-4 border-t border-border/70 p-4">
          <button className="w-full rounded-lg border border-[#c2652a] px-4 py-2 text-sm font-semibold text-[#c2652a] transition-colors hover:bg-[#c2652a] hover:text-white">
            System Status
          </button>
          <div className="space-y-1">
            <a
              className="flex items-center gap-3 px-4 py-2 text-sm text-on-surface-variant transition-colors hover:text-[#c2652a]"
              href="#"
            >
              <MaterialSymbol icon="help_outline" className="text-lg" />
              <span>Support</span>
            </a>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-on-surface-variant transition-colors hover:text-[#c2652a]"
            >
              <MaterialSymbol icon="logout" className="text-lg" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <header className="fixed inset-x-0 top-0 z-30 border-b border-border/70 bg-[#faf5ee]/90 backdrop-blur-md lg:left-64">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex w-full max-w-xl items-center gap-3 rounded-full border border-border/60 bg-background/80 px-4 py-2 text-sm shadow-sm">
            <MaterialSymbol
              icon="search"
              className="text-lg text-on-surface-variant"
            />
            <input
              className="w-full border-none bg-transparent p-0 text-sm outline-none placeholder:text-on-surface-variant/70 focus:ring-0"
              placeholder="Search admin records..."
              type="search"
            />
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden items-center gap-3 text-on-surface-variant sm:flex">
              <button
                title="notifications-button"
                className="transition-colors hover:text-[#c2652a]"
              >
                <MaterialSymbol icon="notifications" className="text-xl" />
              </button>
              <button
                title="activity-button"
                className="transition-colors hover:text-[#c2652a]"
              >
                <MaterialSymbol icon="history" className="text-xl" />
              </button>
            </div>
            <div className="hidden h-6 w-px bg-border/70 sm:block" />
            <div className="flex items-center gap-3">
              <div className="text-right leading-tight">
                <p className="text-xs font-semibold">Admin User</p>
                <p className="text-[10px] text-on-surface-variant">
                  System Console
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2f231d] text-[0.7rem] font-semibold text-white shadow-sm">
                AU
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/60 px-4 py-2 lg:hidden">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {navigationItems.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                    active
                      ? "border-[#c2652a] bg-[#c2652a] text-white"
                      : "border-border/70 bg-background/70 text-on-surface-variant",
                  )}
                >
                  <MaterialSymbol icon={item.icon} className="text-sm" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <main className="lg:pl-64">
        <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-24 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}

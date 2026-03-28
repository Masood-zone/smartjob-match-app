"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { useSession } from "@/lib/auth-client";
import { SessionAvatarBadge } from "./session-avatar-badge";

const navigationItems = [
  { label: "Home", href: "/" },
  { label: "Jobs", href: "/jobs" },
  { label: "Companies", href: "/companies" },
  { label: "About", href: "/about" },
  { label: "Resources", href: "/resources" },
];

type HeaderRole = "USER" | "JOB_SEEKER" | "EMPLOYER" | "ADMIN";

type HeaderSessionUser = {
  role?: string | null;
};

function normalizeRole(role?: string | null): HeaderRole | undefined {
  const normalizedRole = role?.toUpperCase();

  if (
    normalizedRole === "USER" ||
    normalizedRole === "JOB_SEEKER" ||
    normalizedRole === "EMPLOYER" ||
    normalizedRole === "ADMIN"
  ) {
    return normalizedRole;
  }

  return undefined;
}

function getHeaderCta(role?: HeaderRole) {
  switch (role) {
    case "JOB_SEEKER":
      return {
        label: "Begin Job Seeking",
        href: "/onboarding/job-seeker",
      };
    case "EMPLOYER":
      return {
        label: "Become an Employer",
        href: "/onboarding/employer",
      };
    case "ADMIN":
      return {
        label: "System Dashboard",
        href: "/admin/dashboard",
      };
    case "USER":
    default:
      return {
        label: "Looking for a Job",
        href: "/onboarding/job-seeker",
      };
  }
}

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = session?.user as HeaderSessionUser | undefined;
  const userRole = normalizeRole(user?.role);
  const primaryCta = getHeaderCta(userRole);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-[#d8d0c8]/60 bg-[#faf5ee]/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4 sm:gap-12">
          <Link
            href="#hero"
            className="shrink-0 font-serif text-2xl font-bold tracking-tight text-primary sm:text-[2rem]"
          >
            Qualify
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navigationItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={
                  pathname === item.href
                    ? "border-b-2 border-primary pb-1 text-sm font-semibold text-primary"
                    : "text-sm text-stone-600 transition-colors hover:text-primary"
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:block">
            <SessionAvatarBadge />
          </div>
          <Link
            href={primaryCta.href}
            className="hidden cursor-pointer rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:inline-flex"
          >
            {primaryCta.label}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer md:hidden"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <MaterialSymbol icon="menu" className="text-[22px] text-primary" />
          </Button>
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-200 md:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            className="absolute inset-0 cursor-pointer bg-stone-950/82 backdrop-blur-xl"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 flex h-dvh w-full flex-col border-l border-[#d8d0c8]/70 bg-[#fffaf4] shadow-[0_24px_60px_rgba(53,38,31,0.22)] sm:w-[min(100vw,26rem)]">
            <div className="flex items-center justify-between border-b border-[#d8d0c8]/60 px-5 py-4 sm:px-6">
              <div>
                <span className="font-serif text-2xl font-bold tracking-tight text-primary">
                  Qualify
                </span>
                <p className="mt-1 text-xs uppercase tracking-[0.26em] text-stone-500">
                  Qualification-first recruitment
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="cursor-pointer"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
              >
                <MaterialSymbol
                  icon="close"
                  className="text-[22px] text-primary"
                />
              </Button>
            </div>

            <div className="border-b border-[#d8d0c8]/60 px-5 py-5 sm:px-6">
              <SessionAvatarBadge
                onNavigate={() => setMobileMenuOpen(false)}
                mobile
              />
            </div>

            <nav className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-6 sm:px-6">
              {navigationItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={
                    pathname === item.href
                      ? "cursor-pointer rounded-[1.1rem] bg-primary/10 px-4 py-4 text-base font-semibold text-primary ring-1 ring-primary/10"
                      : "cursor-pointer rounded-[1.1rem] px-4 py-4 text-base text-stone-700 transition-colors hover:bg-primary/5 hover:text-primary"
                  }
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}

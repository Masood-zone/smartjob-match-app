"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { MaterialSymbol } from "@/components/common/MaterialSymbol";

const navigationItems = [
  { label: "Find Jobs", href: "/" },
  { label: "About", href: "/about" },
  { label: "Resources", href: "/resources" },
  { label: "Companies", href: "/companies" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#d8d0c8]/60 bg-[#faf5ee]/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-3 lg:px-8">
        <div className="flex items-center gap-12">
          <Link
            href="#hero"
            className="font-serif text-2xl font-bold tracking-tight text-primary"
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

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/login"
            className="cursor-pointer rounded-md px-3 py-2 text-sm text-stone-600 transition-colors hover:text-primary"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="cursor-pointer rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Post a Job
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
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            className="absolute inset-0 cursor-pointer bg-black/35 backdrop-blur-[1px]"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="absolute right-0 top-0 flex h-full w-[min(88vw,22rem)] flex-col border-l border-[#d8d0c8]/70 bg-[#faf5ee] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#d8d0c8]/60 px-5 py-4">
              <span className="font-serif text-2xl font-bold tracking-tight text-primary">
                Qualify
              </span>
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

            <nav className="flex flex-1 flex-col gap-2 px-5 py-6">
              {navigationItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={
                    pathname === item.href
                      ? "cursor-pointer rounded-xl bg-primary/10 px-4 py-3 text-base font-semibold text-primary"
                      : "cursor-pointer rounded-xl px-4 py-3 text-base text-stone-700 transition-colors hover:bg-primary/5 hover:text-primary"
                  }
                >
                  {item.label}
                </Link>
              ))}

              <div className="mt-6 border-t border-[#d8d0c8]/60 pt-6">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="cursor-pointer block rounded-xl px-4 py-3 text-base text-stone-700 transition-colors hover:bg-primary/5 hover:text-primary"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="cursor-pointer mt-2 block rounded-xl bg-primary px-4 py-3 text-center text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Post a Job
                </Link>
              </div>
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}

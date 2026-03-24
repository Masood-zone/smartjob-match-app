"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
          <Button
            variant="ghost"
            className="px-3 text-sm text-stone-600 hover:text-primary"
          >
            Sign In
          </Button>
          <Button className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
            Post a Job
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <MaterialSymbol icon="menu" className="text-[22px] text-primary" />
          </Button>
        </div>
      </div>
    </header>
  );
}

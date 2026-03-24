import Link from "next/link";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(237,200,160,0.45),transparent_34%),radial-gradient(circle_at_top_right,rgba(226,162,123,0.24),transparent_30%),linear-gradient(180deg,rgba(251,245,236,0.96),rgba(247,239,229,0.88))]" />
      <div className="pointer-events-none absolute left-0 top-24 -z-10 h-72 w-72 rounded-full bg-primary/8 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />

      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <MaterialSymbol icon="arrow_back" className="text-[18px]" />
            </span>
            <span className="font-serif text-xl tracking-tight sm:text-2xl">
              Qualify
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-xs uppercase tracking-[0.3em] text-muted-foreground md:flex">
            <Link href="/" className="transition-colors hover:text-foreground">
              Platform
            </Link>
            <Link
              href="/about"
              className="transition-colors hover:text-foreground"
            >
              About
            </Link>
            <Link
              href="/resources"
              className="transition-colors hover:text-foreground"
            >
              Support
            </Link>
          </nav>
        </div>
      </header>

      {children}

      <footer className="border-t border-border/50 bg-background/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 text-xs uppercase tracking-[0.26em] text-muted-foreground sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="font-serif text-lg normal-case tracking-tight text-primary">
            Qualify
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="#" className="transition-colors hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="#" className="transition-colors hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="#" className="transition-colors hover:text-foreground">
              Help Center
            </Link>
          </div>
          <p>© 2026 Qualify Job Match.</p>
        </div>
      </footer>
    </div>
  );
}

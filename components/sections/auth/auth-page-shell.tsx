import { ReactNode } from "react";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { cn } from "@/lib/utils";

type Highlight = {
  icon: string;
  title: string;
  description: string;
};

type AuthPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  highlights?: Highlight[];
  footnote?: ReactNode;
  className?: string;
};

export function AuthPageShell({
  eyebrow,
  title,
  description,
  children,
  highlights = [],
  footnote,
  className,
}: AuthPageShellProps) {
  return (
    <main
      className={cn("relative flex-1 px-4 py-10 sm:px-6 lg:px-8", className)}
    >
      <div className="mx-auto grid w-full max-w-6xl items-start gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(300px,0.88fr)]">
        <section className="order-1 space-y-6 lg:sticky lg:top-28">
          <div className="space-y-3 text-center lg:text-left">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.42em] text-primary/80">
              {eyebrow}
            </p>
            <h1 className="max-w-2xl text-4xl leading-[0.95] text-foreground sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              {description}
            </p>
          </div>

          <div className="hidden rounded-[2rem] border border-border/70 bg-card/85 p-4 shadow-[0_20px_60px_rgba(67,44,26,0.08)] backdrop-blur-sm sm:p-6 lg:block">
            <div className="grid gap-4 sm:grid-cols-2">
              {highlights.map((highlight) => (
                <article
                  key={highlight.title}
                  className="rounded-[1.4rem] border border-border/60 bg-background/85 p-4 shadow-sm"
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                    <MaterialSymbol
                      icon={highlight.icon}
                      className="text-[20px]"
                    />
                  </div>
                  <h2 className="mb-2 text-lg text-foreground">
                    {highlight.title}
                  </h2>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {highlight.description}
                  </p>
                </article>
              ))}
            </div>

            {footnote ? (
              <div className="mt-5 rounded-2xl border border-dashed border-border/60 bg-surface/80 p-4 text-sm text-muted-foreground">
                {footnote}
              </div>
            ) : null}
          </div>
        </section>

        <section className="order-2 rounded-[2rem] border border-border/70 bg-card/95 p-4 shadow-[0_24px_80px_rgba(67,44,26,0.1)] sm:p-6 lg:sticky lg:top-28">
          {children}
        </section>
      </div>
    </main>
  );
}

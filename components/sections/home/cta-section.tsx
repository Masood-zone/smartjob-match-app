import Link from "next/link";
export function CtaSection() {
  return (
    <section id="cta" className="bg-primary px-6 py-24 text-on-primary">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-10 text-center">
        <h2 className="max-w-3xl text-4xl tracking-tight sm:text-5xl lg:text-6xl">
          Ready to redefine your{" "}
          <span className="italic underline decoration-on-primary/30 underline-offset-8">
            hiring experience?
          </span>
        </h2>
        <p className="max-w-2xl text-lg text-on-primary/90 sm:text-xl">
          Join thousands of professionals and employers building the future of
          qualification-first recruitment.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/register"
            className="cursor-pointer inline-flex h-auto items-center justify-center rounded-lg bg-surface px-10 py-4 text-base font-bold text-primary transition-colors hover:bg-surface-dim"
          >
            Get Started Free
          </Link>
          <Link
            href="/about"
            className="cursor-pointer inline-flex h-auto items-center justify-center rounded-lg border border-on-primary px-10 py-4 text-base font-bold text-on-primary transition-colors hover:bg-on-primary/10"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}

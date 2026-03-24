import { Button } from "@/components/ui/button";

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
          <Button className="h-auto rounded-lg bg-surface px-10 py-4 text-base font-bold text-primary hover:bg-surface-dim">
            Get Started Free
          </Button>
          <Button
            variant="outline"
            className="h-auto rounded-lg border-on-primary px-10 py-4 text-base font-bold text-on-primary hover:bg-on-primary/10"
          >
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
}

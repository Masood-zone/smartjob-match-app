import Link from "next/link";

const onboardingPaths = [
  {
    href: "/onboarding/job-seeker",
    eyebrow: "Job seeker",
    title: "Continue your profile build",
    description:
      "Complete the identity, experience, qualification, and review steps that map cleanly to the User and JobSeeker models.",
    cta: "Open job seeker onboarding",
  },
  {
    href: "/onboarding/employer",
    eyebrow: "Employer",
    title: "Set up your hiring account",
    description:
      "Start your employer profile and company setup flow while we keep the structure aligned with the Employer model.",
    cta: "Open employer onboarding",
  },
];

export function OnboardingHub() {
  return (
    <main className="flex-1 px-6 py-16 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-12">
        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-low px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
              Onboarding
            </div>
            <h1 className="max-w-3xl text-4xl tracking-tight text-on-surface sm:text-5xl lg:text-6xl">
              Choose the onboarding track that matches how you use the platform.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-on-surface-variant sm:text-lg">
              This route keeps the job seeker and employer experiences separate,
              while preserving a structure that will later map directly to the
              schema and API layer.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_20px_60px_rgba(58,48,42,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-on-surface-variant">
              If you already registered
            </p>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">
              Sign in first, then continue into the job seeker onboarding flow.
              New users can register, log in, and return here to continue.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Register
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg border border-outline-variant px-5 py-3 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low"
              >
                Login
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          {onboardingPaths.map((path) => (
            <article
              key={path.href}
              className="rounded-[1.75rem] border border-outline-variant bg-surface-container-lowest p-8 shadow-[0_18px_50px_rgba(58,48,42,0.06)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                {path.eyebrow}
              </p>
              <h2 className="mt-4 text-3xl tracking-tight text-on-surface">
                {path.title}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-on-surface-variant">
                {path.description}
              </p>
              <Link
                href={path.href}
                className="mt-8 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {path.cta}
              </Link>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

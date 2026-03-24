const seekerSteps = [
  {
    step: "1",
    title: "Upload Credentials",
    description:
      "Sync your degrees, certifications, and portfolio in one click.",
  },
  {
    step: "2",
    title: "AI Matching",
    description:
      "Our smart system filters thousands of roles to find your perfect fit.",
  },
  {
    step: "3",
    title: "Direct Connection",
    description:
      "Interview with employers who already know you're the right match.",
  },
];

const employerSteps = [
  {
    step: "1",
    title: "Define Requirements",
    description:
      "Specify the exact qualifications and experience your role demands.",
  },
  {
    step: "2",
    title: "Curated Shortlist",
    description:
      "Get a focused list of verified, pre-qualified candidates instantly.",
  },
  {
    step: "3",
    title: "Hire with Confidence",
    description: "Onboard talent that is ready to deliver value from day one.",
  },
];

export function JourneySection() {
  return (
    <section id="journey" className="px-6 py-28">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-10">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-[0.28em] text-primary">
              For Talent
            </span>
            <h2 className="max-w-xl text-4xl tracking-tight text-on-surface sm:text-5xl">
              A streamlined journey to your dream career.
            </h2>
          </div>

          <div className="space-y-10">
            {seekerSteps.map((item) => (
              <div key={item.title} className="flex gap-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary font-serif text-sm font-bold text-primary">
                  {item.step}
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold tracking-tight text-on-surface">
                    {item.title}
                  </h3>
                  <p className="text-on-surface-variant">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-outline-variant/40 bg-surface-container-low p-8 shadow-sm sm:p-12">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-[0.28em] text-tertiary">
              For Employers
            </span>
            <h2 className="max-w-xl text-4xl tracking-tight text-on-surface sm:text-5xl">
              Precision hiring for high-performing teams.
            </h2>
          </div>

          <div className="mt-10 space-y-10">
            {employerSteps.map((item) => (
              <div key={item.title} className="flex gap-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tertiary text-sm font-bold text-on-tertiary font-serif">
                  {item.step}
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold tracking-tight text-on-surface">
                    {item.title}
                  </h3>
                  <p className="text-on-surface-variant">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

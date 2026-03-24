import { MaterialSymbol } from "@/components/common/MaterialSymbol";

const features = [
  {
    icon: "psychology",
    title: "Qualification-based matching",
    description:
      "Beyond keywords. We use semantic analysis to verify that your specific skills and certifications align with actual job demands.",
  },
  {
    icon: "bolt",
    title: "Faster hiring process",
    description:
      "Reduce the time-to-hire by 40%. Our pre-vetting system ensures employers only interview the most qualified candidates.",
  },
  {
    icon: "sentiment_very_satisfied",
    title: "Reduced job mismatch",
    description:
      "Lower turnover rates by matching core competencies and educational backgrounds with roles that truly require them.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-surface-container px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 space-y-4 text-center">
          <h2 className="text-4xl tracking-tight text-on-surface sm:text-5xl">
            The Intelligence Behind the Match
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-on-surface-variant">
            Our system analyzes deep qualification sets to ensure both parties
            are satisfied from day one.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="flex flex-col gap-6 rounded-2xl border border-outline-variant/30 bg-surface p-8 shadow-sm transition-shadow hover:shadow-md md:p-10"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <MaterialSymbol
                  icon={feature.icon}
                  className="text-[30px] text-primary"
                />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-on-surface">
                {feature.title}
              </h3>
              <p className="leading-relaxed text-on-surface-variant">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

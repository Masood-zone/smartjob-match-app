"use client";

import { motion } from "framer-motion";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { SiteFooter } from "@/components/sections/home/site-footer";
import { SiteHeader } from "@/components/sections/home/site-header";

const steps = [
  {
    title: "Capture verified inputs",
    description:
      "The system starts with certificates, qualifications, work history, and skills extracted from the profile.",
    icon: "badge",
  },
  {
    title: "Normalize and compare",
    description:
      "Each candidate profile is normalized against the employer's job requirements so the same skill can be matched consistently.",
    icon: "schema",
  },
  {
    title: "Weight what matters",
    description:
      "Qualifications, skill overlap, and experience depth are weighted more heavily than title keywords alone.",
    icon: "tune",
  },
  {
    title: "Explain the result",
    description:
      "Every recommendation should be easy to understand so users know why they were ranked the way they were.",
    icon: "neurology",
  },
];

const signalCards = [
  {
    title: "Strong signals",
    items: [
      "Degrees and certifications",
      "Skills that directly map to the role",
      "Relevant project or work experience",
    ],
  },
  {
    title: "Soft signals",
    items: [
      "Portfolio quality",
      "Location and flexibility",
      "Career stage and role seniority",
    ],
  },
  {
    title: "Low-priority signals",
    items: [
      "Simple title matching",
      "Generic keyword stuffing",
      "Unverified claims without evidence",
    ],
  },
];

export function ResourcesPage() {
  return (
    <main className="flex-1">
      <SiteHeader />

      <section className="relative overflow-hidden px-6 py-20 lg:py-24">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-0 top-10 h-64 w-64 rounded-full bg-tertiary/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-bold uppercase tracking-[0.32em] text-primary"
          >
            Matching intelligence
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-6 text-5xl leading-[0.96] tracking-tight text-on-surface sm:text-6xl lg:text-7xl"
          >
            How the <span className="italic text-primary">algorithm</span> truly
            works
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-on-surface-variant"
          >
            The matching engine is designed to be transparent,
            qualification-first, and fair. It explains why a candidate fits, not
            just whether a keyword appears on the page.
          </motion.p>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
            {steps.map((step, index) => (
              <motion.article
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className="rounded-2xl border border-outline-variant/40 bg-surface p-7 shadow-sm"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MaterialSymbol icon={step.icon} className="text-[26px]" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-on-surface">
                  {step.title}
                </h2>
                <p className="mt-4 leading-relaxed text-on-surface-variant">
                  {step.description}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low px-6 py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-3">
          {signalCards.map((card, index) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
              className="rounded-3xl border border-outline-variant/40 bg-surface p-8 shadow-sm"
            >
              <div className="mb-4 flex items-center gap-3 text-primary">
                <MaterialSymbol
                  icon={
                    index === 0
                      ? "trending_up"
                      : index === 1
                        ? "visibility"
                        : "block"
                  }
                  className="text-[22px]"
                />
                <h3 className="text-2xl font-bold tracking-tight text-on-surface">
                  {card.title}
                </h3>
              </div>
              <ul className="space-y-4 text-on-surface-variant">
                {card.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <MaterialSymbol
                      icon="check_circle"
                      className="mt-0.5 text-[18px] text-primary"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-outline-variant/40 bg-surface p-8 shadow-sm"
          >
            <div className="flex items-center gap-3 text-primary">
              <MaterialSymbol icon="leaderboard" className="text-[22px]" />
              <span className="text-xs font-bold uppercase tracking-[0.28em]">
                Score bands
              </span>
            </div>
            <div className="mt-6 space-y-5">
              {[
                ["90-100", "Excellent fit, move to shortlist"],
                ["75-89", "Strong fit, review manually"],
                ["60-74", "Possible fit, compare supporting evidence"],
                ["Below 60", "Gap too large for immediate match"],
              ].map(([score, meaning]) => (
                <div
                  key={score}
                  className="flex items-center justify-between gap-6 rounded-2xl bg-surface-container-low px-5 py-4"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary">
                      {score}
                    </p>
                    <p className="text-sm text-on-surface-variant">{meaning}</p>
                  </div>
                  <div className="h-2 w-28 overflow-hidden rounded-full bg-primary/10">
                    <div className="h-full w-full rounded-full bg-primary" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <span className="text-xs font-bold uppercase tracking-[0.32em] text-tertiary">
              Explainability
            </span>
            <h2 className="text-4xl tracking-tight text-on-surface sm:text-5xl">
              Every match should be easy to justify.
            </h2>
            <p className="max-w-2xl leading-relaxed text-on-surface-variant">
              The algorithm is not meant to be a black box. Its job is to rank
              candidates using sensible signals, surface the strongest evidence
              first, and leave enough context for employers and seekers to
              understand the outcome.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                [
                  "Candidate profile",
                  "Skills, credentials, portfolio, and experience are structured before scoring.",
                ],
                [
                  "Job requirements",
                  "Each role is broken down into must-have and nice-to-have signals.",
                ],
              ].map(([title, text]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-outline-variant/40 bg-surface p-5 shadow-sm"
                >
                  <h3 className="font-bold text-on-surface">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

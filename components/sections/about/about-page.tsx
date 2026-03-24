"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { SiteFooter } from "@/components/sections/home/site-footer";
import { SiteHeader } from "@/components/sections/home/site-header";

const goalHighlights = [
  {
    title: "Match by merit",
    description:
      "Qualify is designed to surface people by the credentials, skills, and experience they have actually earned, not by noisy keyword matches alone.",
  },
  {
    title: "Reduce hiring friction",
    description:
      "The system aims to shorten the search, screening, and shortlisting loop so both job seekers and employers spend less time filtering and more time deciding.",
  },
  {
    title: "Guide people clearly",
    description:
      "Its onboarding and matching flows are meant to make the next step obvious, whether a user is building a profile, posting a role, or reviewing a match.",
  },
] as const;

const outcomes = [
  {
    title: "For job seekers",
    description:
      "A calmer path to jobs that fit verified education, practical skills, and real career direction.",
    icon: "person_search",
  },
  {
    title: "For employers",
    description:
      "Cleaner shortlists that help hiring teams move faster without losing quality signals.",
    icon: "work",
  },
  {
    title: "For the platform",
    description:
      "A structured system that can grow with onboarding, matching, and future verification features.",
    icon: "hub",
  },
] as const;

const teamMembers = [
  {
    name: "APPIAH KUBI",
    role: "Chief Project Lead",
    id: "5221040782",
  },
  {
    name: "ADU EMMANUEL",
    role: "Backend & Data Integration",
    id: "5221040770",
  },
  {
    name: "ADAM MOHAMMED",
    role: "Frontend & UI Lead",
    id: "5221040760",
  },
  {
    name: "AWINI IDDRISU RABIU",
    role: "Matching Logic & Algorithm Lead",
    id: "5221040753",
  },
  {
    name: "ATTA YEBOAH SENIOR",
    role: "Research, Documentation & QA",
    id: "5221040769",
  },
];

export function AboutPage() {
  return (
    <main className="flex-1">
      <SiteHeader />

      <section className="relative overflow-hidden px-6 py-20 lg:py-24">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-0 top-20 h-64 w-64 rounded-full bg-tertiary/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="text-xs font-bold uppercase tracking-[0.32em] text-primary"
          >
            About Qualify
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-6 text-5xl leading-[0.96] tracking-tight text-on-surface sm:text-6xl lg:text-7xl"
          >
            A platform built to make hiring more credible and more human.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-on-surface-variant"
          >
            Qualify is shaped to help people present what they have actually
            earned, help employers see fit more clearly, and help both sides
            move through hiring with less noise and more confidence.
          </motion.p>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
          {goalHighlights.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              className="rounded-2xl border border-outline-variant/40 bg-surface p-8 shadow-sm"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MaterialSymbol icon="star" className="text-[26px]" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-on-surface">
                {item.title}
              </h2>
              <p className="mt-4 leading-relaxed text-on-surface-variant">
                {item.description}
              </p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="bg-surface-container-low px-6 py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <span className="text-xs font-bold uppercase tracking-[0.32em] text-tertiary">
              What Qualify is here to do
            </span>
            <h2 className="text-4xl tracking-tight text-on-surface sm:text-5xl">
              Give people a clearer path from profile to opportunity.
            </h2>
            <p className="max-w-2xl leading-relaxed text-on-surface-variant">
              The system is intended to reduce guesswork in recruitment by
              treating qualifications, practical skills, and work history as
              meaningful signals. That means job seekers can show value more
              directly, and employers can focus on candidates who genuinely fit
              the role.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button className="h-auto rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                Explore the workflow
              </Button>
              <Link
                href="/resources"
                className="inline-flex h-auto items-center justify-center rounded-lg border border-primary px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
              >
                Learn how matches are formed
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-outline-variant/40 bg-surface p-8 shadow-sm"
          >
            <div className="space-y-5">
              <div className="flex items-center gap-3 text-primary">
                <MaterialSymbol icon="target" className="text-[24px]" />
                <span className="text-xs font-bold uppercase tracking-[0.28em]">
                  Expected outcomes
                </span>
              </div>
              <div className="space-y-4">
                {outcomes.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl bg-surface-container-low px-5 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <MaterialSymbol
                        icon={item.icon}
                        className="text-[20px] text-primary"
                      />
                      <h3 className="font-bold text-on-surface">
                        {item.title}
                      </h3>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.32em] text-primary">
              Team
            </span>
            <h2 className="mt-4 text-4xl tracking-tight text-on-surface sm:text-5xl">
              Built by five students with one focused platform goal.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
            {teamMembers.map((member, index) => (
              <motion.article
                key={member.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className="rounded-2xl border border-outline-variant/40 bg-surface p-6 shadow-sm"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <MaterialSymbol icon="person" className="text-[30px]" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-on-surface">
                  {member.name}
                </h3>
                <p className="mt-2 text-sm font-semibold uppercase tracking-[0.24em] text-tertiary">
                  {member.role}
                </p>
                <p className="mt-4 text-sm text-on-surface-variant">
                  Student ID: {member.id}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { SiteFooter } from "@/components/sections/home/site-footer";
import { SiteHeader } from "@/components/sections/home/site-header";

type Company = {
  name: string;
  industry: string;
  location: string;
  accent: string;
  description: string;
  about: string[];
  openings: Array<{ title: string; location: string; type: string }>;
  benefits: string[];
  facts: Array<{ label: string; value: string }>;
};

const companies: Company[] = [
  {
    name: "Aureum Capital",
    industry: "Fintech",
    location: "Zurich, CH",
    accent: "from-amber-200 via-orange-200 to-stone-100",
    description:
      "Redefining sustainable wealth through transparent algorithmic trading and ethical asset management.",
    about: [
      "Aureum Capital is focused on disciplined financial products with clear decision-making and responsible growth.",
      "Its culture rewards precision, analytical thinking, and a strong sense of ownership.",
    ],
    openings: [
      {
        title: "Senior Product Analyst",
        location: "Zurich",
        type: "Full-time",
      },
      {
        title: "Risk & Compliance Associate",
        location: "Remote / Europe",
        type: "Full-time",
      },
      {
        title: "Data Operations Intern",
        location: "Zurich",
        type: "Internship",
      },
    ],
    benefits: [
      "Performance bonus",
      "Hybrid flexibility",
      "Professional learning budget",
      "Ethical investing culture",
    ],
    facts: [
      { label: "Founded", value: "2018" },
      { label: "Team Size", value: "120+" },
      { label: "Primary Focus", value: "Wealth technology" },
    ],
  },
  {
    name: "TerraNova Systems",
    industry: "Sustainability",
    location: "San Francisco, US",
    accent: "from-emerald-200 via-lime-100 to-stone-100",
    description:
      "Architecting closed-loop agricultural ecosystems for urban environments.",
    about: [
      "TerraNova designs climate-aware systems for city-scale food production and resilient infrastructure.",
      "The team blends engineering, ecology, and product thinking to build practical sustainability tools.",
    ],
    openings: [
      {
        title: "Product Designer",
        location: "San Francisco",
        type: "Full-time",
      },
      {
        title: "Field Systems Engineer",
        location: "Remote / US",
        type: "Full-time",
      },
      {
        title: "Growth Research Intern",
        location: "San Francisco",
        type: "Internship",
      },
    ],
    benefits: [
      "Mission-driven work",
      "Remote-first teams",
      "Wellness stipend",
      "Climate impact projects",
    ],
    facts: [
      { label: "Founded", value: "2016" },
      { label: "Team Size", value: "240+" },
      { label: "Primary Focus", value: "Agri-tech" },
    ],
  },
  {
    name: "Pulse Genomics",
    industry: "Healthcare",
    location: "Cambridge, UK",
    accent: "from-rose-200 via-pink-100 to-stone-100",
    description:
      "Personalized medicine tailored to your unique genetic heritage.",
    about: [
      "Pulse Genomics builds tools that turn complex biological data into meaningful clinical insight.",
      "The organization values rigor, empathy, and a careful approach to patient-centered innovation.",
    ],
    openings: [
      {
        title: "Clinical Data Analyst",
        location: "Cambridge",
        type: "Full-time",
      },
      {
        title: "Bioinformatics Engineer",
        location: "Hybrid",
        type: "Full-time",
      },
      {
        title: "Research Assistant",
        location: "Cambridge",
        type: "Internship",
      },
    ],
    benefits: [
      "Health coverage",
      "Research access",
      "Learning support",
      "Flexible hours",
    ],
    facts: [
      { label: "Founded", value: "2019" },
      { label: "Team Size", value: "90+" },
      { label: "Primary Focus", value: "Genomics" },
    ],
  },
  {
    name: "Lumina Grid",
    industry: "Energy",
    location: "Casablanca, MA",
    accent: "from-amber-100 via-yellow-100 to-stone-100",
    description:
      "Harnessing the desert sun to power decentralized communities.",
    about: [
      "Lumina Grid builds distributed energy systems for communities that need reliable and affordable power.",
      "The company looks for people who can combine systems thinking with practical delivery.",
    ],
    openings: [
      {
        title: "Energy Systems Designer",
        location: "Casablanca",
        type: "Full-time",
      },
      {
        title: "Operations Coordinator",
        location: "Hybrid",
        type: "Full-time",
      },
      {
        title: "Community Field Fellow",
        location: "Morocco",
        type: "Contract",
      },
    ],
    benefits: [
      "Impact-driven mission",
      "Field exposure",
      "Travel support",
      "Equipment stipend",
    ],
    facts: [
      { label: "Founded", value: "2017" },
      { label: "Team Size", value: "160+" },
      { label: "Primary Focus", value: "Solar infrastructure" },
    ],
  },
  {
    name: "Nomad Transit",
    industry: "Logistics",
    location: "Nairobi, KE",
    accent: "from-stone-200 via-orange-100 to-stone-100",
    description: "Seamless cross-border commerce for independent artisans.",
    about: [
      "Nomad Transit focuses on modern logistics infrastructure that helps small businesses move goods with confidence.",
      "Its product culture values clarity, velocity, and dependable operations.",
    ],
    openings: [
      { title: "Operations Analyst", location: "Nairobi", type: "Full-time" },
      { title: "Product Support Lead", location: "Hybrid", type: "Full-time" },
      {
        title: "Route Planning Associate",
        location: "Nairobi",
        type: "Internship",
      },
    ],
    benefits: [
      "Modern stack",
      "Hybrid flexibility",
      "Team retreats",
      "Travel allowance",
    ],
    facts: [
      { label: "Founded", value: "2020" },
      { label: "Team Size", value: "75+" },
      { label: "Primary Focus", value: "Logistics tech" },
    ],
  },
];

export function CompaniesPage() {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [query, setQuery] = useState("");

  const filteredCompanies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return companies;
    return companies.filter(
      (company) =>
        company.name.toLowerCase().includes(normalizedQuery) ||
        company.industry.toLowerCase().includes(normalizedQuery) ||
        company.description.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

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
            Curated Directory
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-6 text-5xl leading-[0.96] tracking-tight text-on-surface sm:text-6xl lg:text-7xl"
          >
            Companies <span className="italic text-primary">Qualify</span> can
            match with
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-on-surface-variant"
          >
            Explore employers through the same warm, qualification-first lens
            used by the platform. Every company card opens a detail modal with
            openings, benefits, and quick facts.
          </motion.p>
        </div>
      </section>

      <section className="px-6 pb-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 rounded-2xl border border-outline-variant/40 bg-surface p-4 shadow-sm lg:flex-row">
          <div className="relative flex-1">
            <MaterialSymbol
              icon="search"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, industry, or mission..."
              className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-12 py-3 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-primary"
            />
          </div>
          <Button className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <MaterialSymbol icon="filter_list" className="text-[18px]" />
            Filter
          </Button>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredCompanies.map((company, index) => (
            <motion.button
              key={company.name}
              type="button"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: index * 0.04 }}
              onClick={() => setSelectedCompany(company)}
              className="group rounded-3xl border border-outline-variant/40 bg-surface p-8 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${company.accent} text-primary`}
                >
                  <MaterialSymbol icon="apartment" className="text-[28px]" />
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-primary">
                  {company.industry}
                </span>
              </div>

              <h2 className="mt-8 text-2xl font-bold tracking-tight text-on-surface">
                {company.name}
              </h2>
              <p className="mt-4 leading-relaxed text-on-surface-variant">
                {company.description}
              </p>

              <div className="mt-8 flex items-center justify-between border-t border-outline-variant/50 pt-5 text-sm text-on-surface-variant">
                <span>{company.location}</span>
                <MaterialSymbol
                  icon="arrow_forward"
                  className="text-[18px] text-primary transition-transform group-hover:translate-x-1"
                />
              </div>
            </motion.button>
          ))}
        </div>

        {filteredCompanies.length === 0 ? (
          <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-dashed border-outline-variant/60 bg-surface p-8 text-center text-on-surface-variant">
            No companies matched your search.
          </div>
        ) : null}
      </section>

      <Dialog
        open={Boolean(selectedCompany)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCompany(null);
          }
        }}
      >
        {selectedCompany ? (
          <DialogContent className="max-w-5xl p-0">
            <div className="border-b border-outline-variant bg-surface-container-low p-8 text-on-surface sm:p-10">
              <DialogClose className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/15 text-white transition-colors hover:bg-black/25">
                <MaterialSymbol icon="close" className="text-[20px]" />
              </DialogClose>

              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface px-3 py-1 text-xs font-bold uppercase tracking-[0.26em] text-primary">
                    Company Details
                  </div>
                  <DialogTitle className="text-3xl font-semibold tracking-tight text-on-surface sm:text-4xl">
                    {selectedCompany.name}
                  </DialogTitle>
                  <DialogDescription className="max-w-2xl text-sm leading-relaxed text-on-surface-variant sm:text-base">
                    {selectedCompany.description}
                  </DialogDescription>
                </div>
                <div className="rounded-2xl border border-outline-variant bg-surface px-4 py-3 text-sm text-on-surface-variant shadow-sm">
                  {selectedCompany.location}
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-outline-variant bg-surface px-4 py-3">
                  <span className="block text-[11px] font-bold uppercase tracking-[0.24em] text-primary">
                    Industry
                  </span>
                  <span className="mt-1 block text-sm text-on-surface">
                    {selectedCompany.industry}
                  </span>
                </div>
                <div className="rounded-2xl border border-outline-variant bg-surface px-4 py-3">
                  <span className="block text-[11px] font-bold uppercase tracking-[0.24em] text-primary">
                    Openings
                  </span>
                  <span className="mt-1 block text-sm text-on-surface">
                    {selectedCompany.openings.length} live roles
                  </span>
                </div>
                <div className="rounded-2xl border border-outline-variant bg-surface px-4 py-3">
                  <span className="block text-[11px] font-bold uppercase tracking-[0.24em] text-primary">
                    Focus
                  </span>
                  <span className="mt-1 block text-sm text-on-surface">
                    {selectedCompany.facts[2]?.value}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid min-h-0 flex-1 gap-8 overflow-y-auto px-8 py-8 lg:grid-cols-[1.4fr_0.9fr]">
              <div className="space-y-8">
                <section>
                  <h3 className="text-3xl font-bold tracking-tight text-on-surface">
                    About Us
                  </h3>
                  <div className="mt-4 space-y-4 leading-relaxed text-on-surface-variant">
                    {selectedCompany.about.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="flex items-end justify-between gap-4">
                    <h3 className="text-3xl font-bold tracking-tight text-on-surface">
                      Active Job Openings
                    </h3>
                    <span className="text-sm font-bold uppercase tracking-[0.24em] text-primary">
                      {selectedCompany.openings.length} Positions
                    </span>
                  </div>
                  <div className="mt-5 space-y-4">
                    {selectedCompany.openings.map((opening) => (
                      <div
                        key={opening.title}
                        className="flex flex-col gap-4 rounded-2xl border border-outline-variant/40 bg-surface-container-low p-5 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <h4 className="text-lg font-bold text-on-surface">
                            {opening.title}
                          </h4>
                          <div className="mt-2 flex flex-wrap gap-4 text-sm text-on-surface-variant">
                            <span className="flex items-center gap-1">
                              <MaterialSymbol
                                icon="location_on"
                                className="text-[16px]"
                              />{" "}
                              {opening.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <MaterialSymbol
                                icon="schedule"
                                className="text-[16px]"
                              />{" "}
                              {opening.type}
                            </span>
                          </div>
                        </div>
                        <Button className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                          Apply Now
                        </Button>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-low p-6">
                  <h3 className="text-2xl font-bold tracking-tight text-on-surface">
                    Benefits
                  </h3>
                  <ul className="mt-5 space-y-4 text-sm text-on-surface-variant">
                    {selectedCompany.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-3">
                        <MaterialSymbol
                          icon="check_circle"
                          className="mt-0.5 text-[18px] text-primary"
                        />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="rounded-2xl border border-outline-variant/40 bg-surface p-6">
                  <h3 className="text-sm font-bold uppercase tracking-[0.24em] text-on-surface-variant">
                    Quick Facts
                  </h3>
                  <div className="mt-4 space-y-4">
                    {selectedCompany.facts.map((fact) => (
                      <div key={fact.label}>
                        <span className="block text-xs font-bold uppercase tracking-[0.22em] text-primary">
                          {fact.label}
                        </span>
                        <span className="mt-1 block text-lg text-on-surface">
                          {fact.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>

      <SiteFooter />
    </main>
  );
}

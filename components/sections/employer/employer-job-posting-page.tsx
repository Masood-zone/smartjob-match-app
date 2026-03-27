"use client";

import MDEditor from "@uiw/react-md-editor";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { SkillExplorer } from "@/components/sections/onboarding/job-seeker/skill-explorer";
import { useSession } from "@/lib/auth-client";
import { useEmployerDashboardQuery } from "@/services/employer/dashboard";
import { useCreateJobMutation } from "@/services/jobs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { qualificationLevels, skillSectors } from "@/utils/platform-data";

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

function addSkillToken(value: string, currentSkills: string[]) {
  const normalized = value.trim();

  if (!normalized) {
    return currentSkills;
  }

  if (
    currentSkills.some(
      (skill) => skill.toLowerCase() === normalized.toLowerCase(),
    )
  ) {
    return currentSkills;
  }

  return [...currentSkills, normalized];
}

export function EmployerJobPostingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { data } = useEmployerDashboardQuery();
  const createJobMutation = useCreateJobMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(
    "## Role overview\n\nDescribe the responsibilities, success expectations, and day-to-day work for this role.\n\n### Key outcomes\n- What the person should own\n- What success looks like in the first 90 days\n- The tools or systems they will work with",
  );
  const location = data?.employer.location || "Accra, Ghana";
  const [requiredQualification, setRequiredQualification] = useState(
    qualificationLevels[3]?.value || "DEGREE",
  );
  const [requiredSkills, setRequiredSkills] = useState<string[]>([
    "Figma",
    "Design Systems",
    "Prototyping",
  ]);
  const [skillQuery, setSkillQuery] = useState("");
  const [activeSector, setActiveSector] = useState("all");

  const visibleSectors = useMemo(() => {
    const query = skillQuery.trim().toLowerCase();

    return skillSectors.filter((sector) => {
      if (!query) {
        return true;
      }

      return (
        sector.label.toLowerCase().includes(query) ||
        sector.description.toLowerCase().includes(query) ||
        sector.skills.some((skill) => skill.toLowerCase().includes(query))
      );
    });
  }, [skillQuery]);

  const displayedSectors = useMemo(() => {
    if (activeSector === "all") {
      return visibleSectors;
    }

    return visibleSectors.filter((sector) => sector.id === activeSector);
  }, [activeSector, visibleSectors]);

  const visibleSkillsCount = useMemo(
    () =>
      displayedSectors.reduce(
        (total, sector) => total + sector.skills.length,
        0,
      ),
    [displayedSectors],
  );

  const matchBreakdown = useMemo(() => {
    const titleWords = title.trim().split(/\s+/).filter(Boolean).length;
    const descriptionWords = description
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
    const hasMarkdownStructure = /(^|\n)\s*[-*#>]/m.test(description);
    const qualificationIndex = qualificationLevels.findIndex(
      (option) => option.value === requiredQualification,
    );

    const titleClarity = title
      ? clamp(
          52 +
            titleWords * 8 +
            (/(senior|lead|principal|head)/i.test(title) ? 8 : 0),
          50,
          96,
        )
      : 0;

    const descriptionDepth = description
      ? clamp(
          26 +
            Math.floor(descriptionWords / 18) * 7 +
            (hasMarkdownStructure ? 10 : 0),
          0,
          96,
        )
      : 0;

    const skillFocus = requiredSkills.length
      ? clamp(
          48 +
            Math.min(requiredSkills.length, 8) * 6 -
            Math.max(0, requiredSkills.length - 8) * 3,
          42,
          94,
        )
      : 0;

    const locationClarity = location
      ? location.toLowerCase().includes("remote")
        ? 94
        : location.includes(",")
          ? 84
          : 72
      : 0;

    const qualificationClarity =
      qualificationIndex >= 0
        ? clamp(72 + Math.max(0, 4 - qualificationIndex) * 4, 72, 96)
        : 0;

    const weightedScore =
      titleClarity * 0.22 +
      descriptionDepth * 0.28 +
      skillFocus * 0.24 +
      locationClarity * 0.13 +
      qualificationClarity * 0.13;

    const completenessBonus =
      [title, description, location, requiredSkills.length > 0].filter(Boolean)
        .length * 2;

    const matchQuality = clamp(
      Math.round(weightedScore + completenessBonus),
      30,
      98,
    );

    return {
      matchQuality,
      titleClarity,
      descriptionDepth,
      skillFocus,
      locationClarity,
      qualificationClarity,
      descriptionWords,
    };
  }, [
    description,
    location,
    requiredQualification,
    requiredSkills.length,
    title,
  ]);

  const estimatedCandidateCount = useMemo(() => {
    const base = data?.stats.totalApplications ?? 0;
    const skillSignal = Math.max(0, 10 - Math.abs(requiredSkills.length - 5));
    const depthSignal = Math.min(
      10,
      Math.floor(matchBreakdown.descriptionWords / 24),
    );

    return Math.max(24, base * 2 + skillSignal * 4 + depthSignal * 3);
  }, [
    data?.stats.totalApplications,
    matchBreakdown.descriptionWords,
    requiredSkills.length,
  ]);

  const optimizationTips = useMemo(() => {
    return [
      requiredSkills.length > 0
        ? `Specific skills: ${requiredSkills.slice(0, 2).join(", ")} are driving the score.`
        : "Add at least one role-specific skill to improve ranking quality.",
      title
        ? "A concrete title helps the model classify the role faster."
        : "Use a specific title like Senior Product Designer or Full Stack Engineer.",
      matchBreakdown.descriptionWords > 120
        ? "The markdown description is detailed enough to improve match confidence."
        : "Expand the description with outcomes, tools, and responsibilities.",
      location
        ? `Location: ${location} keeps the role aligned with search filters.`
        : "Add a location or remote indicator to reduce mismatched applications.",
    ];
  }, [location, matchBreakdown.descriptionWords, requiredSkills, title]);

  const handleToggleSkill = (skill: string) => {
    setRequiredSkills((current) =>
      current.includes(skill)
        ? current.filter((item) => item !== skill)
        : [...current, skill],
    );
  };

  const handleQuickAddSkill = (skill: string) => {
    setRequiredSkills((current) => addSkillToken(skill, current));
  };

  const handleCreateJob = async () => {
    try {
      const createdJob = await createJobMutation.mutateAsync({
        title,
        description,
        location,
        requiredQualification,
        requiredSkills,
      });

      const createdId = (createdJob as { id?: string }).id;

      if (createdId) {
        router.push(`/onboarding/employer/applicants?jobId=${createdId}`);
      }
    } catch {
      return;
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(240,168,120,0.18),transparent_28%),linear-gradient(180deg,#faf5ee_0%,#f8f1e7_100%)] text-on-background">
      <header className="sticky top-0 z-50 border-b border-[#d8d0c8]/60 bg-[#faf5ee] shadow-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-12">
            <Link
              href="/onboarding/employer/dashboard"
              className="text-2xl font-serif font-bold tracking-tight text-[#c2652a]"
            >
              Qualify
            </Link>
            <nav className="hidden gap-8 md:flex">
              <Link
                href="/jobs"
                className="text-sm text-stone-600 transition-colors hover:text-[#c2652a]"
              >
                Find Jobs
              </Link>
              <Link
                href="/dashboard/job-seeker/companies"
                className="text-sm text-stone-600 transition-colors hover:text-[#c2652a]"
              >
                Companies
              </Link>
              <Link
                href="/resources"
                className="text-sm text-stone-600 transition-colors hover:text-[#c2652a]"
              >
                Resources
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 rounded-full border border-outline-variant bg-surface-container-low px-4 py-2 text-sm text-on-surface-variant sm:flex">
              <MaterialSymbol
                icon="search"
                className="text-[16px] text-stone-400"
              />
              <span>Search talent...</span>
            </div>
            <Link
              href="/onboarding/employer/dashboard"
              className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-on-primary transition-all hover:opacity-90"
            >
              Dashboard
            </Link>
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-outline-variant bg-surface-container-highest text-primary">
              {session?.user?.image ? (
                <Image
                  alt={session.user.name || "Recruiter profile"}
                  src={session.user.image}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              ) : (
                <MaterialSymbol icon="account_circle" className="text-[20px]" />
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex-1 space-y-6">
            <header className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                Create a job
              </p>
              <h1 className="font-serif text-4xl font-medium leading-tight text-on-surface sm:text-5xl">
                Create Job Listing
              </h1>
              <p className="max-w-2xl text-base text-stone-500 sm:text-lg">
                Define your ideal candidate with sun-baked simplicity.
              </p>
            </header>

            <form
              className="space-y-6"
              onSubmit={(event) => {
                event.preventDefault();
                void handleCreateJob();
              }}
            >
              <section className="space-y-5 rounded-[1.5rem] bg-surface-container-low p-6 shadow-[0_12px_34px_rgba(58,48,42,0.04)] lg:p-7">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Field label="Job Title">
                    <input
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="e.g. Senior Product Designer"
                      className="w-full rounded-lg border border-outline-variant bg-white px-4 py-3 font-body outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                      type="text"
                    />
                  </Field>
                  <Field label="Company Name">
                    <input
                      className="w-full cursor-not-allowed rounded-lg border border-outline-variant bg-surface-container-highest/50 px-4 py-3 font-body text-stone-500 outline-none"
                      disabled
                      type="text"
                      value={data?.employer.companyName || "Your company"}
                    />
                  </Field>
                </div>

                <Field label="Required Qualification">
                  <Select
                    value={requiredQualification}
                    onValueChange={setRequiredQualification}
                  >
                    <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white px-4 py-3 font-body outline-none transition-all focus:ring-1 focus:ring-primary">
                      <SelectValue placeholder="Select Minimum Degree" />
                    </SelectTrigger>
                    <SelectContent>
                      {qualificationLevels.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </section>

              <section className="space-y-4 rounded-[1.5rem] bg-surface-container-low p-6 shadow-[0_12px_34px_rgba(58,48,42,0.04)] lg:p-7">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
                      Job description
                    </p>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      Write the posting in Markdown so the structure stays clear
                      for candidates and the match model can read the detail.
                    </p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.24em] text-on-surface-variant">
                    {matchBreakdown.descriptionWords} words
                  </span>
                </div>

                <div
                  data-color-mode="light"
                  className="overflow-hidden rounded-[1.35rem] border border-outline-variant bg-white shadow-[0_2px_16px_rgba(58,48,42,0.04)]"
                >
                  <MDEditor
                    value={description}
                    onChange={(value) => setDescription(value ?? "")}
                    preview="live"
                    height={460}
                    visibleDragbar={false}
                    textareaProps={{
                      placeholder:
                        "Describe the role, responsibilities, and the magic of working at Qualify...",
                    }}
                  />
                </div>
              </section>

              <section className="space-y-4 rounded-[1.5rem] bg-surface-container-low p-6 shadow-[0_12px_34px_rgba(58,48,42,0.04)] lg:p-7">
                <SkillExplorer
                  title="Required skills"
                  selectedSkills={requiredSkills}
                  skillQuery={skillQuery}
                  onSkillQueryChange={setSkillQuery}
                  activeSector={activeSector}
                  onActiveSectorChange={setActiveSector}
                  onToggleSkill={handleToggleSkill}
                  onQuickAddSkill={handleQuickAddSkill}
                  visibleSectors={displayedSectors}
                  visibleSkillsCount={visibleSkillsCount}
                  compact
                />
              </section>

              <div className="flex items-center justify-between border-t border-outline-variant/40 pt-4">
                <Link
                  href="/onboarding/employer/dashboard"
                  className="text-stone-500 transition-colors hover:text-stone-800"
                >
                  Back to dashboard
                </Link>
                <button
                  type="submit"
                  disabled={createJobMutation.isPending}
                  className="rounded-lg bg-primary px-10 py-4 text-lg font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {createJobMutation.isPending
                    ? "Publishing..."
                    : "Publish Job Listing"}
                </button>
              </div>
            </form>
          </div>

          <aside className="w-full lg:w-95">
            <div className="sticky top-24 space-y-8 rounded-2xl border border-outline-variant/60 bg-white p-7 shadow-[0_2px_16px_rgba(58,48,42,0.04)] lg:p-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary">
                  <MaterialSymbol icon="insights" className="text-[18px]" />
                  <h3 className="text-xs font-bold uppercase tracking-widest">
                    Matching Intelligence
                  </h3>
                </div>
                <p className="text-sm text-stone-500">
                  Real-time candidate pool analysis
                </p>
              </div>

              <div className="relative flex flex-col items-center py-4">
                <svg className="h-40 w-40 -rotate-90 transform">
                  <circle
                    className="text-stone-100"
                    cx="80"
                    cy="80"
                    fill="transparent"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="8"
                  />
                  <circle
                    className="text-primary transition-all duration-700"
                    cx="80"
                    cy="80"
                    fill="transparent"
                    r="70"
                    stroke="currentColor"
                    strokeDasharray="440"
                    strokeDashoffset={
                      440 - (440 * matchBreakdown.matchQuality) / 100
                    }
                    strokeLinecap="round"
                    strokeWidth="12"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-serif text-4xl font-bold text-on-surface">
                    {matchBreakdown.matchQuality}%
                  </span>
                  <span className="text-[10px] font-label font-bold uppercase text-stone-400">
                    Match Quality
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-label font-bold uppercase tracking-tight text-stone-500">
                    <span>Estimated Candidates</span>
                    <span className="text-on-surface">
                      {estimatedCandidateCount}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${Math.min(100, matchBreakdown.matchQuality)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-4 rounded-xl bg-surface p-4">
                  <h4 className="font-serif text-sm font-bold text-on-surface">
                    Match breakdown
                  </h4>
                  <div className="space-y-3">
                    <MetricBar
                      label="Title clarity"
                      value={matchBreakdown.titleClarity}
                    />
                    <MetricBar
                      label="Description depth"
                      value={matchBreakdown.descriptionDepth}
                    />
                    <MetricBar
                      label="Skill focus"
                      value={matchBreakdown.skillFocus}
                    />
                    <MetricBar
                      label="Location clarity"
                      value={matchBreakdown.locationClarity}
                    />
                    <MetricBar
                      label="Qualification clarity"
                      value={matchBreakdown.qualificationClarity}
                    />
                  </div>
                </div>

                <div className="space-y-4 rounded-xl bg-surface p-4">
                  <h4 className="font-serif text-sm font-bold text-on-surface">
                    Optimization tips
                  </h4>
                  <ul className="space-y-3">
                    {optimizationTips.map((tip, index) => (
                      <li key={tip} className="flex items-start gap-3">
                        <MaterialSymbol
                          icon={
                            index === 0
                              ? "check_circle"
                              : index === 1
                                ? "lightbulb"
                                : "info"
                          }
                          className="text-[18px] text-primary"
                        />
                        <p className="text-xs leading-relaxed text-stone-600">
                          {tip}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4">
                <div className="group relative h-32 cursor-pointer overflow-hidden rounded-xl">
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                  <div className="absolute inset-0 flex items-end p-4">
                    <span className="text-xs font-label font-semibold text-white">
                      View Market Analysis Report
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-2">
      <span className="block text-xs font-label font-medium uppercase tracking-wider text-stone-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function MetricBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-tight text-stone-500">
        <span>{label}</span>
        <span className="text-on-surface">{value}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

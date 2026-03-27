"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { useSession } from "@/lib/auth-client";
import { useCreateJobMutation } from "@/services/jobs";
import { useEmployerDashboardQuery } from "@/services/employer/dashboard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { qualificationLevels } from "@/utils/platform-data";

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
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(
    data?.employer.location || "Accra, Ghana",
  );
  const [requiredQualification, setRequiredQualification] = useState(
    qualificationLevels[3]?.value || "DEGREE",
  );
  const [requiredSkills, setRequiredSkills] = useState<string[]>([
    "Figma",
    "Design Systems",
    "Prototyping",
  ]);
  const [skillDraft, setSkillDraft] = useState("");

  const estimatedMatchScore = useMemo(() => {
    const score =
      58 + requiredSkills.length * 8 + (title ? 4 : 0) + (description ? 4 : 0);

    return Math.max(45, Math.min(96, score));
  }, [description, requiredSkills.length, title]);

  const estimatedCandidateCount = useMemo(() => {
    const base = data?.stats.totalApplications ?? 0;
    return Math.max(24, base * 3 + requiredSkills.length * 5);
  }, [data?.stats.totalApplications, requiredSkills.length]);

  const optimizationTips = useMemo(() => {
    const tips = [
      requiredSkills.length > 0
        ? `Specific skills: ${requiredSkills.slice(0, 2).join(", ")} will tighten your pool.`
        : "Add at least one role-specific skill to improve ranking quality.",
      title
        ? "Specific title wording helps candidates recognize the role faster."
        : "Use a concrete title like Senior Product Designer or Full Stack Engineer.",
      location
        ? `Location: ${location} keeps the role aligned with search filters.`
        : "Add a location or remote indicator to reduce mismatched applications.",
    ];

    return tips;
  }, [location, requiredSkills, title]);

  const handleCreateJob = async () => {
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
  };

  return (
    <main className="min-h-screen bg-surface text-on-surface antialiased">
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
                <img
                  alt={session.user.name || "Recruiter profile"}
                  src={session.user.image}
                  className="h-full w-full object-cover"
                />
              ) : (
                <MaterialSymbol icon="account_circle" className="text-[20px]" />
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12 lg:flex-row">
          <div className="flex-1 space-y-10">
            <header className="space-y-2">
              <h1 className="font-serif text-5xl font-medium leading-tight text-on-surface">
                Create Job Listing
              </h1>
              <p className="text-lg text-stone-500">
                Define your ideal candidate with sun-baked simplicity.
              </p>
            </header>

            <form
              className="space-y-8"
              onSubmit={(event) => {
                event.preventDefault();
                void handleCreateJob();
              }}
            >
              <section className="space-y-6 rounded-xl bg-surface-container-low p-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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

              <section className="space-y-4">
                <label className="block text-xs font-label font-medium uppercase tracking-wider text-stone-500">
                  Job Description
                </label>
                <div className="overflow-hidden rounded-xl border border-outline-variant bg-white">
                  <div className="flex items-center gap-1 border-b border-outline-variant bg-surface-container-low/50 p-2 text-stone-600">
                    <button
                      type="button"
                      className="rounded p-2 transition-colors hover:bg-stone-200"
                    >
                      <MaterialSymbol
                        icon="format_bold"
                        className="text-[18px]"
                      />
                    </button>
                    <button
                      type="button"
                      className="rounded p-2 transition-colors hover:bg-stone-200"
                    >
                      <MaterialSymbol
                        icon="format_italic"
                        className="text-[18px]"
                      />
                    </button>
                    <button
                      type="button"
                      className="rounded p-2 transition-colors hover:bg-stone-200"
                    >
                      <MaterialSymbol
                        icon="format_list_bulleted"
                        className="text-[18px]"
                      />
                    </button>
                    <button
                      type="button"
                      className="rounded p-2 transition-colors hover:bg-stone-200"
                    >
                      <MaterialSymbol icon="link" className="text-[18px]" />
                    </button>
                    <div className="mx-2 h-6 w-px bg-stone-300" />
                    <button
                      type="button"
                      className="rounded p-2 transition-colors hover:bg-stone-200"
                    >
                      <MaterialSymbol
                        icon="auto_awesome"
                        className="text-[18px]"
                      />
                    </button>
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-tighter text-primary">
                      AI Assist
                    </span>
                  </div>
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Describe the role, responsibilities, and the magic of working at Qualify..."
                    rows={8}
                    className="w-full resize-none p-6 font-body text-stone-700 outline-none"
                  />
                </div>
              </section>

              <section className="space-y-4">
                <label className="block text-xs font-label font-medium uppercase tracking-wider text-stone-500">
                  Required Skills
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() =>
                          setRequiredSkills((current) =>
                            current.filter((item) => item !== skill),
                          )
                        }
                        className="hover:text-primary-container"
                      >
                        <MaterialSymbol icon="close" className="text-[14px]" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <input
                    value={skillDraft}
                    onChange={(event) => setSkillDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        setRequiredSkills((current) =>
                          addSkillToken(skillDraft, current),
                        );
                        setSkillDraft("");
                      }
                    }}
                    placeholder="Type a skill and press enter..."
                    className="w-full rounded-lg border border-outline-variant bg-white px-4 py-3 pr-12 font-body outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                    type="text"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setRequiredSkills((current) =>
                        addSkillToken(skillDraft, current),
                      );
                      setSkillDraft("");
                    }}
                    className="absolute right-4 top-3.5 text-stone-400 transition-colors hover:text-primary"
                  >
                    <MaterialSymbol icon="add_circle" className="text-[18px]" />
                  </button>
                </div>
              </section>

              <div className="flex items-center justify-between border-t border-outline-variant/40 pt-6">
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

          <aside className="w-full lg:w-[380px]">
            <div className="sticky top-28 space-y-8 rounded-2xl border border-outline-variant/60 bg-white p-8 shadow-[0_2px_16px_rgba(58,48,42,0.04)]">
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
                    strokeDashoffset={440 - (440 * estimatedMatchScore) / 100}
                    strokeLinecap="round"
                    strokeWidth="12"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-serif text-4xl font-bold text-on-surface">
                    {estimatedMatchScore}%
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
                    <div className="h-full w-[65%] rounded-full bg-primary" />
                  </div>
                </div>

                <div className="space-y-4 rounded-xl bg-surface p-4">
                  <h4 className="font-serif text-sm font-bold text-on-surface">
                    Optimization Tips
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
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
      </main>
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

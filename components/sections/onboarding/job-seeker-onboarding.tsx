"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";

const steps = [
  {
    key: "identity",
    label: "Identity",
    title: "Build your core profile",
    summary:
      "Capture the user-level identity and the JobSeeker profile fields that drive matching.",
  },
  {
    key: "experience",
    label: "Experience",
    title: "Show your most relevant work history",
    summary:
      "Record a current or latest role now, with room for repeating experience blocks later.",
  },
  {
    key: "qualifications",
    label: "Qualifications",
    title: "Add credentials the algorithm can read",
    summary:
      "Keep the qualification values aligned to the QualificationLevel enum and related profile metadata.",
  },
  {
    key: "review",
    label: "Review",
    title: "Confirm your onboarding details",
    summary:
      "Check the combined profile and confirm the account is ready for the dashboard handoff.",
  },
] as const;

const qualificationOptions = [
  "BECE",
  "WASSCE",
  "DIPLOMA",
  "DEGREE",
  "MASTERS",
  "PHD",
];

const skillOptions = [
  "Product Design",
  "Web Development",
  "Marketing",
  "Management",
  "Sales",
  "Data Analysis",
  "Project Management",
];

type ExperienceEntry = {
  jobTitle: string;
  companyName: string;
  startDate: string;
  endDate: string;
  description: string;
};

export function JobSeekerOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    "Web Development",
    "Data Analysis",
  ]);
  const [identity, setIdentity] = useState({
    firstName: "",
    lastName: "",
    email: "",
    qualification: "DEGREE",
    locationPreference: "Accra, hybrid or remote",
  });
  const [experience, setExperience] = useState<ExperienceEntry[]>([
    {
      jobTitle: "Senior Brand Designer",
      companyName: "Sahara Studio",
      startDate: "2022-08",
      endDate: "Present",
      description:
        "Led visual identity work, collaborated with product teams, and improved delivery consistency.",
    },
  ]);
  const [education, setEducation] = useState({
    qualification: "DEGREE",
    institutionName: "University of Ghana",
    yearOfCompletion: "2021",
    grade: "First Class",
  });
  const [accepted, setAccepted] = useState(false);

  const currentStepData = steps[currentStep];

  const completionCopy = useMemo(
    () => ({
      skillsCount: selectedSkills.length,
      experienceCount: experience.length,
    }),
    [experience.length, selectedSkills.length],
  );

  const toggleSkill = (skill: string) => {
    setSelectedSkills((currentSkills) =>
      currentSkills.includes(skill)
        ? currentSkills.filter((item) => item !== skill)
        : [...currentSkills, skill],
    );
  };

  const addExperience = () => {
    setExperience((currentExperience) => [
      ...currentExperience,
      {
        jobTitle: "",
        companyName: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ]);
  };

  const updateExperience = (
    index: number,
    field: keyof ExperienceEntry,
    value: string,
  ) => {
    setExperience((currentExperience) =>
      currentExperience.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [field]: value } : entry,
      ),
    );
  };

  return (
    <main className="flex-1 overflow-hidden px-6 py-10 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <header className="flex items-center justify-between rounded-[1.5rem] border border-outline-variant bg-surface-container-lowest px-5 py-4 shadow-[0_12px_40px_rgba(58,48,42,0.05)]">
          <Link href="/" className="font-serif text-2xl font-bold text-primary">
            Qualify
          </Link>
          <div className="hidden items-center gap-3 md:flex">
            <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-on-surface-variant">
              Job seeker onboarding
            </span>
            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-surface-container">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant">
            <MaterialSymbol icon="help_outline" className="text-[20px]" />
            <MaterialSymbol icon="close" className="text-[20px]" />
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <aside className="space-y-6">
            <div className="rounded-[1.75rem] border border-outline-variant bg-surface-container-lowest p-8 shadow-[0_18px_50px_rgba(58,48,42,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                Step {currentStep + 1} of {steps.length}
              </p>
              <h1 className="mt-4 text-4xl tracking-tight text-on-surface lg:text-5xl">
                {currentStepData.title}
              </h1>
              <p className="mt-4 text-sm leading-7 text-on-surface-variant lg:text-base">
                {currentStepData.summary}
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-primary/10 bg-primary/5 p-6">
              <div className="flex items-center gap-3 text-primary">
                <MaterialSymbol icon="verified" className="text-[20px]" />
                <p className="text-xs font-semibold uppercase tracking-[0.3em]">
                  Schema-aligned profile
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                The first step maps to User and JobSeeker data. Later fields are
                kept structured so they can be connected to future profile and
                experience models without redesigning the flow.
              </p>
            </div>

            <div className="hidden rounded-[1.75rem] border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_18px_50px_rgba(58,48,42,0.05)] lg:block">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-on-surface-variant">
                Progress markers
              </p>
              <div className="mt-4 space-y-3">
                {steps.map((step, index) => {
                  const isActive = index === currentStep;
                  const isComplete = index < currentStep;

                  return (
                    <button
                      key={step.key}
                      type="button"
                      onClick={() => setCurrentStep(index)}
                      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors ${isActive ? "border-primary bg-primary/5 text-on-surface" : "border-outline-variant bg-surface text-on-surface-variant hover:bg-surface-container-low"}`}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${isActive || isComplete ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface-variant"}`}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span>
                          <span className="block text-sm font-semibold">
                            {step.label}
                          </span>
                          <span className="block text-xs text-on-surface-variant">
                            {step.summary}
                          </span>
                        </span>
                      </span>
                      <MaterialSymbol
                        icon={isComplete ? "check_circle" : "chevron_right"}
                        className={`text-[18px] ${isActive ? "text-primary" : "text-outline"}`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <div className="rounded-[1.75rem] border border-outline-variant bg-surface-container-lowest p-5 shadow-[0_24px_70px_rgba(58,48,42,0.08)] lg:p-8">
            <div className="mb-8 flex items-end justify-between gap-4 border-b border-outline-variant pb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                  {currentStepData.label}
                </p>
                <h2 className="mt-2 text-2xl tracking-tight text-on-surface lg:text-3xl">
                  {currentStepData.title}
                </h2>
              </div>
              <div className="hidden text-right text-xs text-on-surface-variant sm:block">
                <p>{completionCopy.skillsCount} selected skills</p>
                <p>{completionCopy.experienceCount} experience block(s)</p>
              </div>
            </div>

            <div className="space-y-8">
              {currentStep === 0 ? (
                <section className="space-y-6">
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field
                      label="First name"
                      value={identity.firstName}
                      onChange={(value) =>
                        setIdentity((current) => ({
                          ...current,
                          firstName: value,
                        }))
                      }
                      placeholder="E.g. Kofi"
                    />
                    <Field
                      label="Last name"
                      value={identity.lastName}
                      onChange={(value) =>
                        setIdentity((current) => ({
                          ...current,
                          lastName: value,
                        }))
                      }
                      placeholder="E.g. Mensah"
                    />
                  </div>

                  <Field
                    label="Professional email"
                    value={identity.email}
                    onChange={(value) =>
                      setIdentity((current) => ({ ...current, email: value }))
                    }
                    type="email"
                    placeholder="name@domain.com"
                  />

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.28em] text-on-surface-variant">
                      Highest qualification
                    </label>
                    <div className="relative">
                      <select
                        value={identity.qualification}
                        onChange={(event) =>
                          setIdentity((current) => ({
                            ...current,
                            qualification: event.target.value,
                          }))
                        }
                        className="w-full appearance-none rounded-lg border border-outline-variant bg-surface px-4 py-3 text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
                      >
                        {qualificationOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <MaterialSymbol
                        icon="expand_more"
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[20px] text-outline"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.28em] text-on-surface-variant">
                      Core skills
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {skillOptions.map((skill) => {
                        const active = selectedSkills.includes(skill);

                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill)}
                            className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${active ? "border-primary bg-primary text-on-primary" : "border-outline-variant bg-surface text-on-surface hover:border-primary hover:text-primary"}`}
                          >
                            {skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Field
                    label="Location preference"
                    value={identity.locationPreference}
                    onChange={(value) =>
                      setIdentity((current) => ({
                        ...current,
                        locationPreference: value,
                      }))
                    }
                    placeholder="E.g. Accra, remote, or hybrid"
                  />
                </section>
              ) : null}

              {currentStep === 1 ? (
                <section className="space-y-5">
                  {experience.map((entry, index) => (
                    <article
                      key={index}
                      className="rounded-[1.5rem] border border-outline-variant bg-surface-container-low p-5 lg:p-6"
                    >
                      <div className="mb-5 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                            Experience {index + 1}
                          </p>
                          <h3 className="mt-2 text-2xl tracking-tight text-on-surface">
                            Current or latest role
                          </h3>
                        </div>
                        <MaterialSymbol
                          icon="work"
                          className="text-[20px] text-outline"
                        />
                      </div>

                      <div className="grid gap-5 md:grid-cols-2">
                        <Field
                          label="Job title"
                          value={entry.jobTitle}
                          onChange={(value) =>
                            updateExperience(index, "jobTitle", value)
                          }
                          placeholder="e.g. Senior Brand Designer"
                        />
                        <Field
                          label="Company name"
                          value={entry.companyName}
                          onChange={(value) =>
                            updateExperience(index, "companyName", value)
                          }
                          placeholder="e.g. Sahara Studio"
                        />
                        <Field
                          label="Start date"
                          value={entry.startDate}
                          onChange={(value) =>
                            updateExperience(index, "startDate", value)
                          }
                          placeholder="MM / YYYY"
                        />
                        <Field
                          label="End date"
                          value={entry.endDate}
                          onChange={(value) =>
                            updateExperience(index, "endDate", value)
                          }
                          placeholder="Present"
                        />
                        <div className="md:col-span-2 space-y-2">
                          <label className="block text-[10px] font-bold uppercase tracking-[0.28em] text-on-surface-variant">
                            Achievement and description
                          </label>
                          <textarea
                            value={entry.description}
                            onChange={(event) =>
                              updateExperience(
                                index,
                                "description",
                                event.target.value,
                              )
                            }
                            rows={4}
                            placeholder="Describe the impact you made in this role..."
                            className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/15"
                          />
                        </div>
                      </div>
                    </article>
                  ))}

                  <button
                    type="button"
                    onClick={addExperience}
                    className="flex w-full items-center justify-center gap-3 rounded-[1.25rem] border-2 border-dashed border-outline-variant px-5 py-4 text-sm font-semibold text-on-surface-variant transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                  >
                    <MaterialSymbol icon="add_circle" className="text-[20px]" />
                    Add another experience
                  </button>
                </section>
              ) : null}

              {currentStep === 2 ? (
                <section className="space-y-6">
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field
                      label="Highest qualification"
                      value={education.qualification}
                      onChange={(value) =>
                        setEducation((current) => ({
                          ...current,
                          qualification: value,
                        }))
                      }
                      placeholder="DEGREE"
                    />
                    <Field
                      label="Institution name"
                      value={education.institutionName}
                      onChange={(value) =>
                        setEducation((current) => ({
                          ...current,
                          institutionName: value,
                        }))
                      }
                      placeholder="e.g. University of Ghana"
                    />
                    <Field
                      label="Year of completion"
                      value={education.yearOfCompletion}
                      onChange={(value) =>
                        setEducation((current) => ({
                          ...current,
                          yearOfCompletion: value,
                        }))
                      }
                      placeholder="YYYY"
                    />
                    <Field
                      label="Grade (optional)"
                      value={education.grade}
                      onChange={(value) =>
                        setEducation((current) => ({
                          ...current,
                          grade: value,
                        }))
                      }
                      placeholder="e.g. First Class"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.28em] text-on-surface-variant">
                      Core skills
                    </label>
                    <div className="rounded-[1.5rem] border border-outline-variant bg-surface-container-low p-4">
                      <div className="flex flex-wrap gap-2.5">
                        {selectedSkills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-2 rounded-full bg-primary px-3.5 py-2 text-xs font-semibold text-on-primary"
                          >
                            {skill}
                            <MaterialSymbol
                              icon="close"
                              className="text-[14px]"
                            />
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              ) : null}

              {currentStep === 3 ? (
                <section className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <SummaryCard
                      label="Identity"
                      title={`${identity.firstName || "First"} ${identity.lastName || "Last"}`.trim()}
                      copy={identity.email || "name@domain.com"}
                    />
                    <SummaryCard
                      label="JobSeeker profile"
                      title={identity.qualification}
                      copy={`${selectedSkills.length} selected skill${selectedSkills.length === 1 ? "" : "s"}`}
                    />
                    <SummaryCard
                      label="Experience"
                      title={
                        experience[0]?.jobTitle || "Current or latest role"
                      }
                      copy={experience[0]?.companyName || "Company name"}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <SummaryCard
                      label="Education"
                      title={education.institutionName || "Institution name"}
                      copy={`${education.qualification} · ${education.yearOfCompletion || "Year"}`}
                    />
                    <SummaryCard
                      label="Location preference"
                      title={
                        identity.locationPreference || "Location preference"
                      }
                      copy="Used to improve local and remote job ranking"
                    />
                  </div>

                  <label className="flex items-start gap-3 rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-4 text-sm text-on-surface-variant">
                    <input
                      checked={accepted}
                      onChange={(event) => setAccepted(event.target.checked)}
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
                    />
                    <span>
                      I confirm that the information above is accurate and I am
                      ready to continue to the dashboard handoff.
                    </span>
                  </label>
                </section>
              ) : null}
            </div>

            <div className="mt-10 flex flex-col gap-4 border-t border-outline-variant pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep((step) => Math.max(step - 1, 0))}
                disabled={currentStep === 0}
                className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <MaterialSymbol icon="arrow_back" className="text-[18px]" />
                Previous step
              </button>

              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setCurrentStep((step) =>
                      Math.min(step + 1, steps.length - 1),
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-[0_16px_34px_rgba(194,101,42,0.22)] transition-all hover:bg-primary/90"
                >
                  Continue
                  <MaterialSymbol
                    icon="arrow_forward"
                    className="text-[18px]"
                  />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!accepted}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-[0_16px_34px_rgba(194,101,42,0.22)] transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Complete profile
                  <MaterialSymbol icon="check" className="text-[18px]" />
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-bold uppercase tracking-[0.28em] text-on-surface-variant">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/15"
      />
    </div>
  );
}

function SummaryCard({
  label,
  title,
  copy,
}: {
  label: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-outline-variant bg-surface-container-low p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
        {label}
      </p>
      <h3 className="mt-3 text-xl tracking-tight text-on-surface">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-on-surface-variant">{copy}</p>
    </div>
  );
}

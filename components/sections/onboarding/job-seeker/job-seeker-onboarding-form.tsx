import Link from "next/link";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { useJobSeekerOnboardingStore } from "@/stores/job-seeker-onboarding-store";

import { ExperienceStep } from "./experience-step";
import { IdentityStep } from "./identity-step";
import { QualificationsStep } from "./qualifications-step";
import { ReviewStep } from "./review-step";
import {
  jobSeekerOnboardingDefaultValues,
  type JobSeekerOnboardingValues,
} from "./job-seeker-onboarding-types";

const steps = [
  {
    key: "identity",
    label: "Identity",
    title: "Enter your identity details",
    summary:
      "Fill in your name, email, qualification, skills, and location so the profile can be matched correctly.",
    guidance:
      "Start here by entering the details that identify your account and shape the first matching pass.",
  },
  {
    key: "experience",
    label: "Experience",
    title: "Add your work history",
    summary:
      "List your current or latest role first, then add any earlier roles that help the system understand your background.",
    guidance:
      "Add at least one role with dates and a short description of the work you actually did.",
  },
  {
    key: "qualifications",
    label: "Qualifications",
    title: "Confirm your academic record",
    summary:
      "Choose the qualification band, add the institution, and confirm when you completed it.",
    guidance:
      "Pick the qualification that best matches your highest completed level and use the institution list when possible.",
  },
  {
    key: "review",
    label: "Review",
    title: "Review and submit",
    summary:
      "Check the combined profile, accept the declaration, and submit the onboarding record.",
    guidance:
      "Review every section before submitting because this step writes the stored profile and onboarding progress.",
  },
] as const;

export default function JobSeekerOnboardingForm() {
  const methods = useForm<JobSeekerOnboardingValues>({
    defaultValues: jobSeekerOnboardingDefaultValues,
    shouldUnregister: false,
    mode: "onSubmit",
  });
  const [hoveredStepIndex, setHoveredStepIndex] = useState<number | null>(null);

  const { currentStep, data, setCurrentStep } = useJobSeekerOnboardingStore();

  const goNext = () =>
    setCurrentStep(Math.min(currentStep + 1, steps.length - 1));
  const goBack = () => setCurrentStep(Math.max(currentStep - 1, 0));

  const activeStep = steps[currentStep];
  const stepProgress = ((currentStep + 1) / steps.length) * 100;

  return (
    <FormProvider {...methods}>
      <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <header className="sticky top-4 z-40 rounded-[1.5rem] border border-outline-variant bg-surface-container-lowest/92 px-5 py-4 shadow-[0_12px_40px_rgba(58,48,42,0.08)] backdrop-blur-xl">
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/"
                className="font-serif text-2xl font-bold text-primary transition-opacity hover:opacity-80"
              >
                Qualify
              </Link>

              <div className="flex flex-1 flex-wrap items-center justify-center gap-3">
                <span className="hidden text-[10px] font-semibold uppercase tracking-[0.28em] text-on-surface-variant md:inline-flex">
                  Job seeker onboarding
                </span>
                <div className="h-1.5 w-36 overflow-hidden rounded-full bg-surface-container">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${stepProgress}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-on-surface-variant">
                  {String(currentStep + 1).padStart(2, "0")}/{steps.length}
                </span>
              </div>

              <div className="flex items-center gap-2 text-on-surface-variant">
                <HoverInfoButton
                  label="How this page works"
                  title="Onboarding flow"
                  body="Complete the steps in order. The progress map shows the current step, and each help button explains the exact action you should take next."
                />
                <MaterialSymbol icon="close" className="text-[20px]" />
              </div>
            </div>
          </header>

          <section className="grid gap-6">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <div className="rounded-[1.75rem] border border-outline-variant bg-surface-container-lowest p-5 shadow-[0_18px_50px_rgba(58,48,42,0.06)] sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-2xl space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                      Step {currentStep + 1} of {steps.length}
                    </p>
                    <div>
                      <h1 className="text-3xl tracking-tight text-on-surface lg:text-4xl">
                        {activeStep.title}
                      </h1>
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-on-surface-variant lg:text-base">
                        {activeStep.summary}
                      </p>
                    </div>
                  </div>

                  <HoverInfoButton
                    label="Step guidance"
                    title={activeStep.label}
                    body={activeStep.guidance}
                  />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <HoverInfoButton
                    label="Saved data"
                    title="Current payload"
                    body={`${data.skills.length} skill${data.skills.length === 1 ? "" : "s"}, ${data.experience.length} experience block${data.experience.length === 1 ? "" : "s"}, and the latest step snapshot are saved as you move through the form.`}
                  />
                  <HoverInfoButton
                    label="Navigation"
                    title="Step controls"
                    body="Use the next and previous buttons to move between sections. Each step submission keeps the latest data in the store and in the database draft record."
                  />
                  <HoverInfoButton
                    label="Completion"
                    title="Final submit"
                    body="The last step writes the onboarding draft to the database, marks the onboarding status, and prepares the profile for the dashboard handoff."
                  />
                </div>
              </div>

              <div className="sticky top-24 rounded-[1.75rem] border border-outline-variant bg-surface-container-lowest p-5 shadow-[0_18px_50px_rgba(58,48,42,0.05)] sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-primary">
                    <MaterialSymbol icon="route" className="text-[20px]" />
                    <p className="text-xs font-semibold uppercase tracking-[0.3em]">
                      Progress map
                    </p>
                  </div>
                  <HoverInfoButton
                    label="Map help"
                    title="Step map"
                    body="Hover or focus a step pill to read the instructions. Click a pill to jump back to that part of the form."
                  />
                </div>

                <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
                  {steps.map((step, index) => {
                    const isActive = index === currentStep;
                    const isHovered = index === hoveredStepIndex;

                    return (
                      <button
                        key={step.key}
                        type="button"
                        onClick={() => setCurrentStep(index)}
                        onMouseEnter={() => setHoveredStepIndex(index)}
                        onMouseLeave={() => setHoveredStepIndex(null)}
                        onFocus={() => setHoveredStepIndex(index)}
                        onBlur={() => setHoveredStepIndex(null)}
                        className={`inline-flex min-w-28 flex-1 items-center gap-3 rounded-full border px-4 py-3 text-left transition-all ${isActive ? "border-primary bg-primary/10 text-on-surface shadow-[0_10px_24px_rgba(194,101,42,0.12)]" : isHovered ? "border-primary/70 bg-primary/5 text-on-surface" : "border-outline-variant bg-surface text-on-surface-variant hover:border-primary/50 hover:bg-surface-container-low"}`}
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isActive ? "bg-primary text-on-primary" : isHovered ? "bg-primary/80 text-on-primary" : "bg-surface-container-highest text-on-surface-variant"}`}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[11px] font-semibold uppercase tracking-[0.24em]">
                            {step.label}
                          </span>
                          <span className="mt-1 block truncate text-xs text-on-surface-variant">
                            {step.summary}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </nav>

                <div className="mt-4 rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
                    {steps[hoveredStepIndex ?? currentStep].label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                    {steps[hoveredStepIndex ?? currentStep].guidance}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-outline-variant bg-surface-container-lowest p-5 shadow-[0_24px_70px_rgba(58,48,42,0.08)] sm:p-6 lg:p-8">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-outline-variant pb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                    {activeStep.label}
                  </p>
                  <h2 className="mt-2 text-2xl tracking-tight text-on-surface lg:text-3xl">
                    {activeStep.title}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
                  <HoverInfoButton
                    label="What to enter"
                    title="Form checklist"
                    body={activeStep.summary}
                  />
                  <HoverInfoButton
                    label="Step order"
                    title="Sequence"
                    body={steps
                      .map((step, index) => `${index + 1}. ${step.label}`)
                      .join(" • ")}
                  />
                </div>
              </div>
              {currentStep === 0 ? <IdentityStep onContinue={goNext} /> : null}
              {currentStep === 1 ? (
                <ExperienceStep onBack={goBack} onContinue={goNext} />
              ) : null}
              {currentStep === 2 ? (
                <QualificationsStep onBack={goBack} onContinue={goNext} />
              ) : null}
              {currentStep === 3 ? <ReviewStep onBack={goBack} /> : null}
            </div>
          </section>
        </div>
      </main>
    </FormProvider>
  );
}

function HoverInfoButton({
  label,
  title,
  body,
}: {
  label: string;
  title: string;
  body: string;
}) {
  return (
    <div className="group relative inline-flex">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
      >
        <MaterialSymbol icon="info" className="text-[16px]" />
        {label}
      </button>
      <div className="pointer-events-none absolute bottom-full right-0 z-30 mb-2 w-80 translate-y-1 rounded-2xl border border-outline-variant bg-card p-4 text-left opacity-0 shadow-[0_18px_50px_rgba(58,48,42,0.18)] transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">
          {title}
        </p>
        <p className="mt-2 text-sm leading-6 text-on-surface-variant">{body}</p>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { FormProvider, useForm } from "react-hook-form";
import { useJobSeekerOnboardingStore } from "@/stores/job-seeker-onboarding-store";

import { ExperienceStep } from "./job-seeker/experience-step";
import { IdentityStep } from "./job-seeker/identity-step";
import { QualificationsStep } from "./job-seeker/qualifications-step";
import { ReviewStep } from "./job-seeker/review-step";
import {
  jobSeekerOnboardingDefaultValues,
  type JobSeekerOnboardingValues,
} from "./job-seeker/job-seeker-onboarding-types";

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

export function JobSeekerOnboarding() {
  return <JobSeekerOnboardingForm />;
}

function JobSeekerOnboardingForm() {
  const methods = useForm<JobSeekerOnboardingValues>({
    defaultValues: jobSeekerOnboardingDefaultValues,
    shouldUnregister: false,
    mode: "onSubmit",
  });

  const { currentStep, data, setCurrentStep } = useJobSeekerOnboardingStore();

  const goNext = () =>
    setCurrentStep(Math.min(currentStep + 1, steps.length - 1));
  const goBack = () => setCurrentStep(Math.max(currentStep - 1, 0));

  const activeStep = steps[currentStep];
  const stepProgress = ((currentStep + 1) / steps.length) * 100;

  return (
    <FormProvider {...methods}>
      <main className="flex-1 overflow-hidden px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-400 flex-col gap-6">
          <header className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-outline-variant bg-surface-container-lowest px-5 py-4 shadow-[0_12px_40px_rgba(58,48,42,0.05)]">
            <Link
              href="/"
              className="font-serif text-2xl font-bold text-primary"
            >
              Qualify
            </Link>

            <div className="flex flex-1 items-center justify-center gap-3">
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
                title="Full page onboarding"
                body="This layout is intentionally wide so the form can breathe across the page. Hover buttons replace the old sidebar notes and keep the page cleaner."
              />
              <MaterialSymbol icon="close" className="text-[20px]" />
            </div>
          </header>

          <section className="grid flex-1 gap-6">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
              <div className="rounded-[1.75rem] border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_18px_50px_rgba(58,48,42,0.06)] sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-3xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                      Step {currentStep + 1} of {steps.length}
                    </p>
                    <h1 className="mt-4 text-4xl tracking-tight text-on-surface lg:text-5xl">
                      {activeStep.title}
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-on-surface-variant lg:text-base">
                      {activeStep.summary}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <HoverInfoButton
                      label="Step guidance"
                      title={activeStep.label}
                      body={activeStep.summary}
                    />
                    <HoverInfoButton
                      label="Saved data"
                      title="Current payload"
                      body={`${data.skills.length} skill${data.skills.length === 1 ? "" : "s"} selected, ${data.experience.length} experience block${data.experience.length === 1 ? "" : "s"} captured, and the store keeps this data available between steps.`}
                    />
                    <HoverInfoButton
                      label="Navigation"
                      title="Quick step switching"
                      body="Use the step form buttons to move forward or back. The store preserves the current data while React Hook Form keeps each field responsive."
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-primary/10 bg-primary/5 p-6 shadow-[0_18px_50px_rgba(58,48,42,0.04)]">
                <div className="flex items-center gap-3 text-primary">
                  <MaterialSymbol icon="verified" className="text-[20px]" />
                  <p className="text-xs font-semibold uppercase tracking-[0.3em]">
                    Store-backed wizard
                  </p>
                </div>
                <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                  The shared store preserves the full onboarding payload between
                  steps, while React Hook Form handles the actual field state.
                </p>
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
                    label="Progress map"
                    title="Step sequence"
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
      <div className="pointer-events-none absolute right-0 top-full z-30 mt-2 w-80 translate-y-1 rounded-2xl border border-outline-variant bg-card p-4 text-left opacity-0 shadow-[0_18px_50px_rgba(58,48,42,0.18)] transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">
          {title}
        </p>
        <p className="mt-2 text-sm leading-6 text-on-surface-variant">{body}</p>
      </div>
    </div>
  );
}

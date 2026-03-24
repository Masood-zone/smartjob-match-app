"use client";

import Link from "next/link";
import { useState } from "react";

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
  const [hoveredStepIndex, setHoveredStepIndex] = useState<number | null>(null);

  const { currentStep, data, setCurrentStep } = useJobSeekerOnboardingStore();

  const goNext = () =>
    setCurrentStep(Math.min(currentStep + 1, steps.length - 1));
  const goBack = () => setCurrentStep(Math.max(currentStep - 1, 0));

  const activeStep = steps[currentStep];
  const stepProgress = ((currentStep + 1) / steps.length) * 100;

  return (
    <FormProvider {...methods}>
      <main className="flex-1 overflow-hidden px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col gap-6">
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
                title="Onboarding flow"
                body="Complete each step in order. The progress map shows where you are, and the help buttons explain the exact action for the step you are on."
              />
              <MaterialSymbol icon="close" className="text-[20px]" />
            </div>
          </header>

          <section className="grid flex-1 gap-6">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
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
                      body={
                        currentStep === 0
                          ? "Enter your identity, qualification level, skills, and work location preference. Use the pills and typeahead fields to keep things fast."
                          : currentStep === 1
                            ? "Add one or more experience entries, remove any that are not needed, and capture start and end dates for each role."
                            : currentStep === 2
                              ? "Choose your grade level with the pills, pick an institution from the list or type a custom one, and confirm the completion year."
                              : "Review the data you entered, confirm the accuracy checkbox, and complete the onboarding flow."
                      }
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

              <div className="rounded-[1.75rem] border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_18px_50px_rgba(58,48,42,0.05)]">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-primary">
                    <MaterialSymbol icon="route" className="text-[20px]" />
                    <p className="text-xs font-semibold uppercase tracking-[0.3em]">
                      Progress map
                    </p>
                  </div>
                  <HoverInfoButton
                    label="Map help"
                    title="Step map"
                    body="Hover or tap the step pills to preview each stage. The current step stays highlighted so you can track your position at a glance."
                  />
                </div>

                <div className="mt-4 space-y-3">
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
                        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all ${isActive ? "border-primary bg-primary/10 text-on-surface shadow-[0_10px_24px_rgba(194,101,42,0.12)]" : isHovered ? "border-primary/70 bg-primary/5 text-on-surface" : "border-outline-variant bg-surface text-on-surface-variant hover:border-primary/50 hover:bg-surface-container-low"}`}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${isActive ? "bg-primary text-on-primary" : isHovered ? "bg-primary/80 text-on-primary" : "bg-surface-container-highest text-on-surface-variant"}`}
                          >
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span>
                            <span className="block text-sm font-semibold">
                              {step.label}
                            </span>
                            <span className="block text-xs text-on-surface-variant">
                              {isHovered ? step.summary : step.summary}
                            </span>
                          </span>
                        </span>
                        <MaterialSymbol
                          icon={isActive ? "check_circle" : "chevron_right"}
                          className={`text-[18px] ${isActive ? "text-primary" : "text-outline"}`}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
                    {steps[hoveredStepIndex ?? currentStep].label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                    {steps[hoveredStepIndex ?? currentStep].summary}
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
      <div className="pointer-events-none absolute bottom-full right-0 z-30 mb-2 w-80 translate-y-1 rounded-2xl border border-outline-variant bg-card p-4 text-left opacity-0 shadow-[0_18px_50px_rgba(58,48,42,0.18)] transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">
          {title}
        </p>
        <p className="mt-2 text-sm leading-6 text-on-surface-variant">{body}</p>
      </div>
    </div>
  );
}

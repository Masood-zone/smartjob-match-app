"use client";
import JobSeekerOnboardingForm from "./job-seeker/job-seeker-onboarding-form";
import { JobSeekerOnboardingGate } from "./job-seeker/job-seeker-onboarding-gate";

export function JobSeekerOnboarding() {
  return (
    <JobSeekerOnboardingGate>
      <JobSeekerOnboardingForm />
    </JobSeekerOnboardingGate>
  );
}

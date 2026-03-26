"use client";

import { EmployerOnboardingForm, EmployerOnboardingGate } from "./employer";

export function EmployerOnboarding() {
  return (
    <EmployerOnboardingGate>
      <EmployerOnboardingForm />
    </EmployerOnboardingGate>
  );
}

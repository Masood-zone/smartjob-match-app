import type {
  JobSeekerOnboardingStepKey,
  JobSeekerOnboardingValues,
} from "@/components/sections/onboarding/job-seeker/job-seeker-onboarding-types";

const stepOrder: Record<JobSeekerOnboardingStepKey, number> = {
  identity: 0,
  experience: 1,
  qualifications: 2,
  review: 3,
};

export async function saveJobSeekerOnboardingStep({
  stepKey,
  values,
}: {
  stepKey: JobSeekerOnboardingStepKey;
  values: JobSeekerOnboardingValues;
}) {
  const response = await fetch("/api/onboarding/job-seeker", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: values.email,
      currentStep: stepOrder[stepKey],
      stepKey,
      values,
    }),
  });

  const payload = (await response.json().catch(() => null)) as {
    error?: string;
    message?: string;
  } | null;

  if (!response.ok) {
    throw new Error(
      payload?.error || payload?.message || "Unable to save onboarding data",
    );
  }

  return payload;
}

import type {
  JobSeekerOnboardingStepKey,
  JobSeekerOnboardingValues,
} from "@/components/sections/onboarding/job-seeker/job-seeker-onboarding-types";
import { api, getAxiosErrorMessage } from "@/services/api/axios";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const stepOrder: Record<JobSeekerOnboardingStepKey, number> = {
  identity: 0,
  experience: 1,
  qualifications: 2,
  review: 3,
};

type SaveJobSeekerOnboardingStepResponse = {
  completed: boolean;
  ok: boolean;
  onboarding: unknown;
};

export async function saveJobSeekerOnboardingStep({
  stepKey,
  values,
}: {
  stepKey: JobSeekerOnboardingStepKey;
  values: JobSeekerOnboardingValues;
}): Promise<SaveJobSeekerOnboardingStepResponse> {
  const response = await api.post<SaveJobSeekerOnboardingStepResponse>(
    "/api/onboarding/job-seeker",
    {
      email: values.email,
      currentStep: stepOrder[stepKey],
      stepKey,
      values,
    },
  );

  return response.data;
}

export function useStoreJobSeekerOnboardingStep() {
  return useMutation({
    mutationFn: saveJobSeekerOnboardingStep,
    onError: (error) => {
      const message = getAxiosErrorMessage(error);
      toast.error(message);
    },
  });
}

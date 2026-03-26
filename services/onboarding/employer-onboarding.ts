import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import type {
  EmployerOnboardingStepKey,
  EmployerOnboardingValues,
} from "@/components/sections/onboarding/employer/employer-onboarding-types";
import { api, getAxiosErrorMessage } from "@/services/api/axios";

const stepOrder: Record<
  Exclude<EmployerOnboardingStepKey, "welcome">,
  number
> = {
  "basic-info": 1,
  verification: 2,
  "team-setup": 3,
  review: 4,
};

type SaveEmployerOnboardingStepResponse = {
  completed: boolean;
  ok: boolean;
  onboarding: unknown;
};

export async function saveEmployerOnboardingStep({
  stepKey,
  values,
}: {
  stepKey: Exclude<EmployerOnboardingStepKey, "welcome">;
  values: EmployerOnboardingValues;
}): Promise<SaveEmployerOnboardingStepResponse> {
  const response = await api.post<SaveEmployerOnboardingStepResponse>(
    "/api/onboarding/employer",
    {
      email: values.accountEmail,
      currentStep: stepOrder[stepKey],
      stepKey,
      values,
    },
  );

  return response.data;
}

export function useStoreEmployerOnboardingStep() {
  return useMutation({
    mutationFn: saveEmployerOnboardingStep,
    onError: (error) => {
      const message = getAxiosErrorMessage(error);
      toast.error(message);
    },
  });
}

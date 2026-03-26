import { create } from "zustand";

import {
  employerOnboardingDefaultValues,
  type EmployerOnboardingValues,
} from "@/components/sections/onboarding/employer/employer-onboarding-types";

export type EmployerOnboardingStoreState = {
  currentStep: number;
  data: EmployerOnboardingValues;
};

export type EmployerOnboardingStoreActions = {
  setCurrentStep: (step: number) => void;
  saveStepData: (values: EmployerOnboardingValues) => void;
  reset: () => void;
};

export type EmployerOnboardingStore = EmployerOnboardingStoreState &
  EmployerOnboardingStoreActions;

export const employerOnboardingInitialState: EmployerOnboardingStoreState = {
  currentStep: 0,
  data: employerOnboardingDefaultValues,
};

export const useEmployerOnboardingStore = create<EmployerOnboardingStore>()(
  (set) => ({
    ...employerOnboardingInitialState,
    setCurrentStep: (step) =>
      set(() => ({
        currentStep: step,
      })),
    saveStepData: (values) =>
      set(() => ({
        data: values,
      })),
    reset: () =>
      set(() => ({
        ...employerOnboardingInitialState,
      })),
  }),
);

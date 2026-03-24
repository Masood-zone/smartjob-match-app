import { create } from "zustand";

import {
  jobSeekerOnboardingDefaultValues,
  type JobSeekerOnboardingValues,
} from "@/components/sections/onboarding/job-seeker/job-seeker-onboarding-types";

export type JobSeekerOnboardingStoreState = {
  currentStep: number;
  data: JobSeekerOnboardingValues;
};

export type JobSeekerOnboardingStoreActions = {
  setCurrentStep: (step: number) => void;
  saveStepData: (values: JobSeekerOnboardingValues) => void;
  reset: () => void;
};

export type JobSeekerOnboardingStore = JobSeekerOnboardingStoreState &
  JobSeekerOnboardingStoreActions;

export const jobSeekerOnboardingInitialState: JobSeekerOnboardingStoreState = {
  currentStep: 0,
  data: jobSeekerOnboardingDefaultValues,
};

export const useJobSeekerOnboardingStore = create<JobSeekerOnboardingStore>()(
  (set) => ({
    ...jobSeekerOnboardingInitialState,
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
        ...jobSeekerOnboardingInitialState,
      })),
  }),
);

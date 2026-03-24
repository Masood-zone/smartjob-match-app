"use client";

import { Controller, useFormContext } from "react-hook-form";
import { useMemo } from "react";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { useJobSeekerOnboardingStore } from "@/stores/job-seeker-onboarding-store";
import { qualificationLevels } from "@/utils/platform-data";

import { Field } from "./field";
import { YearField } from "./year-field";
import type { JobSeekerOnboardingValues } from "./job-seeker-onboarding-types";

export function QualificationsStep({
  onBack,
  onContinue,
}: {
  onBack: () => void;
  onContinue: () => void;
}) {
  const { control, handleSubmit, watch } =
    useFormContext<JobSeekerOnboardingValues>();
  const { saveStepData } = useJobSeekerOnboardingStore();
  const selectedQualificationValue = watch("qualification");
  const selectedQualification = useMemo(
    () =>
      qualificationLevels.find(
        (option) => option.value === selectedQualificationValue,
      ) ?? qualificationLevels[3],
    [selectedQualificationValue],
  );

  const onSubmit = handleSubmit((values) => {
    saveStepData(values);
    onContinue();
  });

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-[10px] font-bold uppercase tracking-[0.28em] text-on-surface-variant">
            Highest qualification
          </label>
          <Controller
            control={control}
            name="qualification"
            render={({ field }) => (
              <div className="relative">
                <select
                  {...field}
                  className="w-full appearance-none rounded-lg border border-outline-variant bg-surface px-4 py-3 text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
                >
                  {qualificationLevels.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <MaterialSymbol
                  icon="expand_more"
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[20px] text-outline"
                />
              </div>
            )}
          />
        </div>

        <Field
          name="institutionName"
          label="Institution name"
          placeholder="e.g. University of Ghana"
        />

        <Controller
          control={control}
          name="yearOfCompletion"
          render={({ field }) => (
            <YearField
              label="Year of completion"
              year={field.value}
              onSelectYear={field.onChange}
            />
          )}
        />

        <Field
          name="grade"
          label="Grade (optional)"
          placeholder="e.g. First Class"
        />
      </div>

      <div className="rounded-[1.5rem] border border-outline-variant bg-surface-container-low p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
          Qualification bands
        </p>
        <p className="mt-2 text-sm text-on-surface-variant">
          {selectedQualification.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedQualification.gradeLevels.map((grade) => (
            <span
              key={grade}
              className="rounded-full border border-outline-variant bg-surface px-3 py-1.5 text-xs font-semibold text-on-surface"
            >
              {grade}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary"
        >
          <MaterialSymbol icon="arrow_back" className="text-[18px]" />
          Previous step
        </button>

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-[0_16px_34px_rgba(194,101,42,0.22)] transition-all hover:bg-primary/90"
        >
          Continue
          <MaterialSymbol icon="arrow_forward" className="text-[18px]" />
        </button>
      </div>
    </form>
  );
}

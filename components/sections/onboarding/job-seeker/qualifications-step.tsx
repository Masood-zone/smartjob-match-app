"use client";

import { useMemo } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { saveJobSeekerOnboardingStep } from "@/services/onboarding/job-seeker-onboarding";
import { useJobSeekerOnboardingStore } from "@/stores/job-seeker-onboarding-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getInstitutionsForQualification,
  qualificationLevels,
} from "@/utils/platform-data";

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
  const { control, handleSubmit, setValue } =
    useFormContext<JobSeekerOnboardingValues>();
  const { saveStepData } = useJobSeekerOnboardingStore();
  const selectedQualificationValue = useWatch({
    control,
    name: "qualification",
  });
  const selectedGradeLevel = useWatch({ control, name: "gradeLevel" });
  const institutionName = useWatch({ control, name: "institutionName" });

  const selectedQualification = useMemo(
    () =>
      qualificationLevels.find(
        (option) => option.value === selectedQualificationValue,
      ) ?? qualificationLevels[3],
    [selectedQualificationValue],
  );
  const institutionSuggestions = getInstitutionsForQualification(
    selectedQualificationValue,
  );
  const institutionSelectValue = institutionSuggestions.includes(
    institutionName,
  )
    ? institutionName
    : "custom";

  const onSubmit = handleSubmit((values) => {
    saveStepData(values);
    return saveJobSeekerOnboardingStep({
      stepKey: "qualifications",
      values,
    })
      .then(() => {
        toast.success("Qualification step saved");
        onContinue();
      })
      .catch((error: Error) => {
        toast.error(error.message || "Unable to save qualification step");
      });
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
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select qualification" />
                </SelectTrigger>
                <SelectContent>
                  {qualificationLevels.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] font-bold uppercase tracking-[0.28em] text-on-surface-variant">
            Institution name
          </label>
          <Select
            value={institutionSelectValue}
            onValueChange={(value) => {
              if (value === "custom") {
                setValue("institutionName", "", { shouldDirty: true });
                return;
              }

              setValue("institutionName", value, { shouldDirty: true });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select institution" />
            </SelectTrigger>
            <SelectContent>
              {institutionSuggestions.map((institution) => (
                <SelectItem key={institution} value={institution}>
                  {institution}
                </SelectItem>
              ))}
              <SelectItem value="custom">Other / type custom</SelectItem>
            </SelectContent>
          </Select>
          {institutionSelectValue === "custom" ? (
            <Field
              name="institutionName"
              label="Custom institution"
              placeholder="Type your institution"
            />
          ) : null}
        </div>

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
      </div>

      <div className="rounded-[1.5rem] border border-outline-variant bg-surface-container-low p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
          Qualification bands
        </p>
        <p className="mt-2 text-sm text-on-surface-variant">
          {selectedQualification.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedQualification.gradeLevels.map((grade) => {
            const active = selectedGradeLevel === grade;

            return (
              <button
                key={grade}
                type="button"
                onClick={() =>
                  setValue("gradeLevel", grade, { shouldDirty: true })
                }
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${active ? "border-primary bg-primary text-on-primary" : "border-outline-variant bg-surface text-on-surface hover:border-primary hover:text-primary"}`}
              >
                {grade}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary"
        >
          <span className="text-[18px]">←</span>
          Previous step
        </button>

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-[0_16px_34px_rgba(194,101,42,0.22)] transition-all hover:bg-primary/90"
        >
          Continue
          <span className="text-[18px]">→</span>
        </button>
      </div>
    </form>
  );
}

"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { toast } from "sonner";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { saveJobSeekerOnboardingStep } from "@/services/onboarding/job-seeker-onboarding";
import { useJobSeekerOnboardingStore } from "@/stores/job-seeker-onboarding-store";

import { DateField } from "./date-field";
import { Field } from "./field";
import type { JobSeekerOnboardingValues } from "./job-seeker-onboarding-types";

export function ExperienceStep({
  onBack,
  onContinue,
}: {
  onBack: () => void;
  onContinue: () => void;
}) {
  const { control, handleSubmit, register, getValues, setValue } =
    useFormContext<JobSeekerOnboardingValues>();
  const { saveStepData } = useJobSeekerOnboardingStore();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "experience",
  });

  const onSubmit = handleSubmit((values) => {
    saveStepData(values);
    return saveJobSeekerOnboardingStep({
      stepKey: "experience",
      values,
    })
      .then(() => {
        toast.success("Experience step saved");
        onContinue();
      })
      .catch((error: Error) => {
        toast.error(error.message || "Unable to save experience step");
      });
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      {fields.map((entry, index) => (
        <article
          key={entry.id}
          className="rounded-[1.5rem] border border-outline-variant bg-surface-container-low p-5 lg:p-6"
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                Experience {index + 1}
              </p>
              <h3 className="mt-2 text-2xl tracking-tight text-on-surface">
                Current or latest role
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <MaterialSymbol
                icon="work"
                className="text-[20px] text-outline"
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="inline-flex items-center gap-2 rounded-full border border-outline-variant px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
              >
                <MaterialSymbol icon="delete" className="text-[16px]" />
                Remove
              </button>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field
              name={`experience.${index}.jobTitle` as const}
              label="Job title"
              placeholder="e.g. Senior Brand Designer"
            />
            <Field
              name={`experience.${index}.companyName` as const}
              label="Company name"
              placeholder="e.g. Sahara Studio"
            />
            <DateField
              label="Start date"
              selected={getValues(`experience.${index}.startDate`)}
              onSelect={(date) =>
                setValue(`experience.${index}.startDate`, date, {
                  shouldDirty: true,
                })
              }
              placeholder="Pick a start date"
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <label className="block text-[10px] font-bold uppercase tracking-[0.28em] text-on-surface-variant">
                  End date
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const nextValue = !getValues(
                      `experience.${index}.isCurrentRole`,
                    );
                    setValue(`experience.${index}.isCurrentRole`, nextValue, {
                      shouldDirty: true,
                    });

                    if (nextValue) {
                      setValue(`experience.${index}.endDate`, undefined, {
                        shouldDirty: true,
                      });
                    }
                  }}
                  className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] transition-colors ${getValues(`experience.${index}.isCurrentRole`) ? "border-primary bg-primary/10 text-primary" : "border-outline-variant bg-surface text-on-surface-variant"}`}
                >
                  {getValues(`experience.${index}.isCurrentRole`)
                    ? "Current role"
                    : "Mark current"}
                </button>
              </div>

              {getValues(`experience.${index}.isCurrentRole`) ? (
                <div className="flex min-h-13 items-center rounded-lg border border-dashed border-outline-variant bg-surface-container-low px-4 text-sm text-on-surface-variant">
                  Present
                </div>
              ) : (
                <DateField
                  label=""
                  selected={getValues(`experience.${index}.endDate`)}
                  onSelect={(date) =>
                    setValue(`experience.${index}.endDate`, date, {
                      shouldDirty: true,
                    })
                  }
                  placeholder="Pick an end date"
                  hideLabel
                />
              )}
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-[0.28em] text-on-surface-variant">
                Achievement and description
              </label>
              <textarea
                rows={4}
                placeholder="Describe the impact you made in this role..."
                className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/15"
                {...register(`experience.${index}.description` as const)}
              />
            </div>
          </div>
        </article>
      ))}

      <button
        type="button"
        onClick={() =>
          append({
            jobTitle: "",
            companyName: "",
            startDate: undefined,
            endDate: undefined,
            isCurrentRole: false,
            description: "",
          })
        }
        className="flex w-full items-center justify-center gap-3 rounded-[1.25rem] border-2 border-dashed border-outline-variant px-5 py-4 text-sm font-semibold text-on-surface-variant transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
      >
        <MaterialSymbol icon="add_circle" className="text-[20px]" />
        Add another experience
      </button>

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

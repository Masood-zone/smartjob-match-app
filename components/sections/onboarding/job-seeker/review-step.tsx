"use client";

import { Controller, useFormContext } from "react-hook-form";
import { toast } from "sonner";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { saveJobSeekerOnboardingStep } from "@/services/onboarding/job-seeker-onboarding";
import { useJobSeekerOnboardingStore } from "@/stores/job-seeker-onboarding-store";

import { SummaryCard } from "./summary-card";
import type { JobSeekerOnboardingValues } from "./job-seeker-onboarding-types";

export function ReviewStep({ onBack }: { onBack: () => void }) {
  const { handleSubmit, getValues, control } =
    useFormContext<JobSeekerOnboardingValues>();
  const { data, saveStepData } = useJobSeekerOnboardingStore();

  const onSubmit = handleSubmit((values) => {
    saveStepData(values);
    return saveJobSeekerOnboardingStep({
      stepKey: "review",
      values,
    })
      .then(() => {
        toast.success("Onboarding completed and saved");
        console.log("Job Seeker Onboarding Payload", values);
        console.log("Job Seeker Store Snapshot", data);
        console.log("Job Seeker RHF Snapshot", getValues());
      })
      .catch((error: Error) => {
        toast.error(error.message || "Unable to complete onboarding");
      });
  });

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          label="Identity"
          title={`${data.firstName || "First"} ${data.lastName || "Last"}`.trim()}
          copy={data.email || "name@domain.com"}
        />
        <SummaryCard
          label="JobSeeker profile"
          title={data.qualification}
          copy={`${data.skills.length} selected skill${data.skills.length === 1 ? "" : "s"} · ${data.gradeLevel || "Grade level"}`}
        />
        <SummaryCard
          label="Experience"
          title={data.experience[0]?.jobTitle || "Current or latest role"}
          copy={data.experience[0]?.companyName || "Company name"}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SummaryCard
          label="Education"
          title={data.institutionName || "Institution name"}
          copy={`${data.qualification} · ${data.gradeLevel || "Grade level"} · ${data.yearOfCompletion || "Year"}`}
        />
        <SummaryCard
          label="Location preference"
          title={
            data.locationMode === "REMOTE"
              ? "Remote"
              : data.locationMode === "PART_TIME"
                ? "Part Time"
                : [data.locationRegion, data.locationCity]
                    .filter(Boolean)
                    .join(", ") || "Specific location"
          }
          copy={
            data.locationMode === "SPECIFIC_LOCATION"
              ? "Select a region and city or type a new one if needed."
              : "Used to align the roles you want with the work style you prefer."
          }
        />
      </div>

      <Controller
        control={control}
        name="accepted"
        render={({ field }) => (
          <label className="flex items-start gap-3 rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-4 text-sm text-on-surface-variant">
            <input
              type="checkbox"
              checked={field.value}
              onChange={(event) => field.onChange(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
            />
            <span>
              I confirm that the information above is accurate and I am ready to
              continue to the dashboard handoff.
            </span>
          </label>
        )}
      />

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
          Complete profile
          <MaterialSymbol icon="check" className="text-[18px]" />
        </button>
      </div>
    </form>
  );
}

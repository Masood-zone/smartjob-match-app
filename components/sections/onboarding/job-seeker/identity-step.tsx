"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { useSession } from "@/lib/auth-client";
import { useStoreJobSeekerOnboardingStep } from "@/services/onboarding/job-seeker-onboarding";
import { useJobSeekerOnboardingStore } from "@/stores/job-seeker-onboarding-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getTownsForRegion,
  ghanaRegions,
  locationModes,
  qualificationLevels,
  skillSectors,
} from "@/utils/platform-data";

import { Field } from "./field";
import { SkillExplorer } from "./skill-explorer";
import type { JobSeekerOnboardingValues } from "./job-seeker-onboarding-types";

export function IdentityStep({ onContinue }: { onContinue: () => void }) {
  const { control, setValue, getValues, handleSubmit, formState } =
    useFormContext<JobSeekerOnboardingValues>();
  const { saveStepData } = useJobSeekerOnboardingStore();
  const saveStepMutation = useStoreJobSeekerOnboardingStep();
  const { data: session } = useSession();
  const skills = useWatch({ control, name: "skills" }) ?? [];
  const qualification = useWatch({ control, name: "qualification" });
  const locationMode = useWatch({ control, name: "locationMode" });
  const locationRegion = useWatch({ control, name: "locationRegion" });
  const locationCity = useWatch({ control, name: "locationCity" });
  const [skillQuery, setSkillQuery] = useState("");
  const [activeSector, setActiveSector] = useState("all");

  const currentQualification = useMemo(
    () =>
      qualificationLevels.find((item) => item.value === qualification) ??
      qualificationLevels[3],
    [qualification],
  );

  const visibleSectors = useMemo(() => {
    const searchValue = skillQuery.trim().toLowerCase();

    return skillSectors.filter((sector) => {
      const matchesSearch = searchValue
        ? sector.label.toLowerCase().includes(searchValue) ||
          sector.skills.some((skill) =>
            skill.toLowerCase().includes(searchValue),
          )
        : true;

      return matchesSearch;
    });
  }, [skillQuery]);

  const toggleSkill = (skill: string) => {
    const currentSkills = getValues("skills");

    setValue(
      "skills",
      currentSkills.includes(skill)
        ? currentSkills.filter((item) => item !== skill)
        : [...currentSkills, skill],
      { shouldDirty: true, shouldTouch: true },
    );
  };

  const addSuggestedSkill = (skill: string) => {
    const currentSkills = getValues("skills");

    if (!currentSkills.includes(skill)) {
      setValue("skills", [...currentSkills, skill], {
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  };

  const regionSuggestions = ghanaRegions.map((region) => region.name);
  const citySuggestions = getTownsForRegion(locationRegion || "Greater Accra");
  const regionSelectValue = regionSuggestions.includes(locationRegion)
    ? locationRegion
    : "custom";
  const citySelectValue = citySuggestions.includes(locationCity)
    ? locationCity
    : "custom";

  useEffect(() => {
    const sessionEmail = session?.user?.email;

    if (sessionEmail && !getValues("email")) {
      setValue("email", sessionEmail, {
        shouldDirty: false,
        shouldTouch: false,
      });
    }
  }, [getValues, session?.user?.email, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    if (values.skills.length === 0) {
      toast.error("Select at least one skill before continuing");
      return;
    }

    saveStepData(values);
    try {
      await saveStepMutation.mutateAsync({
        stepKey: "identity",
        values,
      });

      toast.success("Identity step saved");
      onContinue();
    } catch {
      return;
    }
  });

  return (
    <form className="space-y-8" onSubmit={onSubmit}>
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          name="firstName"
          label="First name"
          placeholder="E.g. Kofi"
          rules={{ required: "First name is required" }}
        />
        <Field
          name="lastName"
          label="Last name"
          placeholder="E.g. Mensah"
          rules={{ required: "Last name is required" }}
        />
      </div>

      <Field
        name="email"
        label="Professional email"
        type="email"
        placeholder="name@domain.com"
        readOnly
        rules={{
          required: "Professional email is required",
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Enter a valid email address",
          },
        }}
      />

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-2">
          <label className="block text-[10px] font-bold uppercase tracking-[0.28em] text-on-surface-variant">
            Highest qualification
          </label>
          <Controller
            control={control}
            name="qualification"
            rules={{ required: "Select your highest qualification" }}
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
          {formState.errors.qualification?.message ? (
            <p className="text-xs text-destructive">
              {formState.errors.qualification.message}
            </p>
          ) : null}
        </div>

        <div className="rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
            Grade levels for {currentQualification.label}
          </p>
          <p className="mt-2 text-sm text-on-surface-variant">
            {currentQualification.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {currentQualification.gradeLevels.map((grade) => (
              <span
                key={grade}
                className="rounded-full border border-outline-variant bg-surface px-3 py-1.5 text-xs font-semibold text-on-surface"
              >
                {grade}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-[1.5rem] border border-outline-variant bg-surface-container-low p-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
              Core skills
            </p>
            <p className="mt-1 text-sm text-on-surface-variant">
              A large catalog of skills and sectors is available for more
              precise matching.
            </p>
          </div>
          <p className="text-xs text-on-surface-variant">
            {skills.length} selected
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => toggleSkill(skill)}
              className="cursor-pointer rounded-full border border-primary bg-primary px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-on-primary transition-opacity hover:opacity-90"
            >
              {skill}
            </button>
          ))}
        </div>

        {formState.submitCount > 0 && skills.length === 0 ? (
          <p className="text-xs text-destructive">
            Select at least one skill before continuing.
          </p>
        ) : null}

        <SkillExplorer
          title="Available skill sectors"
          selectedSkills={skills}
          skillQuery={skillQuery}
          onSkillQueryChange={setSkillQuery}
          activeSector={activeSector}
          onActiveSectorChange={setActiveSector}
          onToggleSkill={toggleSkill}
          onQuickAddSkill={addSuggestedSkill}
          visibleSectors={visibleSectors}
          visibleSkillsCount={visibleSectors.reduce(
            (total, sector) => total + sector.skills.length,
            0,
          )}
          compact
        />
      </div>

      <div className="space-y-4 rounded-[1.5rem] border border-outline-variant bg-surface-container-low p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
              Work preference
            </p>
            <p className="mt-1 text-sm text-on-surface-variant">
              Choose how and where you want to work.
            </p>
          </div>
        </div>

        <Controller
          control={control}
          name="locationMode"
          rules={{ required: "Choose a work preference" }}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);

                if (value !== "SPECIFIC_LOCATION") {
                  setValue("locationRegion", "", { shouldDirty: true });
                  setValue("locationCity", "", { shouldDirty: true });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select work preference" />
              </SelectTrigger>
              <SelectContent>
                {locationModes.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {formState.errors.locationMode?.message ? (
          <p className="text-xs text-destructive">
            {formState.errors.locationMode.message}
          </p>
        ) : null}

        {locationMode === "SPECIFIC_LOCATION" ? (
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-[0.28em] text-on-surface-variant">
                Region
              </label>
              <Select
                value={regionSelectValue}
                onValueChange={(value) => {
                  if (value === "custom") {
                    setValue("locationRegion", "", { shouldDirty: true });
                    setValue("locationCity", "", { shouldDirty: true });
                    return;
                  }

                  setValue("locationRegion", value, { shouldDirty: true });
                  setValue("locationCity", "", { shouldDirty: true });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a region" />
                </SelectTrigger>
                <SelectContent>
                  {regionSuggestions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Other / type custom</SelectItem>
                </SelectContent>
              </Select>
              {regionSelectValue === "custom" ? (
                <Field
                  name="locationRegion"
                  label="Custom region"
                  placeholder="Type a region"
                  rules={{ required: "Type your region" }}
                />
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-[0.28em] text-on-surface-variant">
                City / town
              </label>
              <Select
                value={citySelectValue}
                onValueChange={(value) => {
                  if (value === "custom") {
                    setValue("locationCity", "", { shouldDirty: true });
                    return;
                  }

                  setValue("locationCity", value, { shouldDirty: true });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent>
                  {citySuggestions.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Other / type custom</SelectItem>
                </SelectContent>
              </Select>
              {citySelectValue === "custom" ? (
                <Field
                  name="locationCity"
                  label="Custom city"
                  placeholder="Type a city or town"
                  rules={{ required: "Type your city or town" }}
                />
              ) : null}
            </div>
          </div>
        ) : (
          <div className="rounded-[1.25rem] border border-dashed border-outline-variant bg-surface px-4 py-3 text-sm text-on-surface-variant">
            {locationModes.find((option) => option.value === locationMode)
              ?.description ?? "Choose how you want to work."}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end pt-2">
        <button
          type="submit"
          disabled={saveStepMutation.isPending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-[0_16px_34px_rgba(194,101,42,0.22)] transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saveStepMutation.isPending ? "Saving..." : "Continue"}
          <MaterialSymbol icon="arrow_forward" className="text-[18px]" />
        </button>
      </div>
    </form>
  );
}

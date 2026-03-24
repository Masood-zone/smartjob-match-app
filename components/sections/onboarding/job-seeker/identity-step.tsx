"use client";

import { useMemo, useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { useJobSeekerOnboardingStore } from "@/stores/job-seeker-onboarding-store";
import { qualificationLevels, skillSectors } from "@/utils/platform-data";

import { Field } from "./field";
import { SkillExplorer } from "./skill-explorer";
import type { JobSeekerOnboardingValues } from "./job-seeker-onboarding-types";

export function IdentityStep({ onContinue }: { onContinue: () => void }) {
  const { control, setValue, getValues, handleSubmit } =
    useFormContext<JobSeekerOnboardingValues>();
  const { saveStepData } = useJobSeekerOnboardingStore();
  const skills = useWatch({ control, name: "skills" }) ?? [];
  const qualification = useWatch({ control, name: "qualification" });
  const [skillQuery, setSkillQuery] = useState("");
  const [activeSector, setActiveSector] = useState("all");
  const currentQualification = useMemo(
    () =>
      qualificationLevels.find((item) => item.value === qualification) ??
      qualificationLevels[3],
    [qualification],
  );

  const visibleSectors = useMemo(() => {
    const searchValue = `${activeSector} ${skillQuery}`.trim().toLowerCase();

    return skillSectors.filter((sector) => {
      const matchesSector =
        activeSector === "all" || sector.id === activeSector;
      const matchesSearch = searchValue
        ? sector.label.toLowerCase().includes(searchValue) ||
          sector.skills.some((skill) =>
            skill.toLowerCase().includes(searchValue),
          )
        : true;

      return matchesSector && matchesSearch;
    });
  }, [activeSector, skillQuery]);

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

  const onSubmit = handleSubmit((values) => {
    saveStepData(values);
    onContinue();
  });

  return (
    <form className="space-y-8" onSubmit={onSubmit}>
      <div className="grid gap-5 md:grid-cols-2">
        <Field name="firstName" label="First name" placeholder="E.g. Kofi" />
        <Field name="lastName" label="Last name" placeholder="E.g. Mensah" />
      </div>

      <Field
        name="email"
        label="Professional email"
        type="email"
        placeholder="name@domain.com"
      />

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
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
              className="rounded-full border border-primary bg-primary px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-on-primary transition-opacity hover:opacity-90"
            >
              {skill}
            </button>
          ))}
        </div>

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

      <Field
        name="locationPreference"
        label="Location preference"
        placeholder="E.g. Accra, remote, or hybrid"
      />

      <div className="flex items-center justify-end pt-2">
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

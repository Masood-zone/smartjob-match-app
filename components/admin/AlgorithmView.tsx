"use client";

import { useMemo } from "react";

import { AlgorithmConfigForm } from "./AlgorithmConfigForm";

import {
  useAdminAlgorithmConfigQuery,
  useSaveAdminAlgorithmConfigMutation,
} from "@/services/admin/algorithm";
import type { AdminAlgorithmConfigInput } from "@/services/admin/types";

const defaultAlgorithmConfig: AdminAlgorithmConfigInput = {
  qualificationWeight: 40,
  skillsWeight: 30,
  experienceWeight: 20,
  preferenceWeight: 10,
  strictQualification: true,
  allowOverqualified: true,
  allowUnderqualified: false,
  minimumSkillMatchPercent: 40,
};

export function AlgorithmView() {
  const { data, isLoading, isError, error } = useAdminAlgorithmConfigQuery();
  const saveMutation = useSaveAdminAlgorithmConfigMutation();
  const initialConfig = useMemo(
    () =>
      data
        ? {
            id: data.id,
            qualificationWeight: data.qualificationWeight,
            skillsWeight: data.skillsWeight,
            experienceWeight: data.experienceWeight,
            preferenceWeight: data.preferenceWeight,
            strictQualification: data.strictQualification,
            allowOverqualified: data.allowOverqualified,
            allowUnderqualified: data.allowUnderqualified,
            minimumSkillMatchPercent: data.minimumSkillMatchPercent,
          }
        : defaultAlgorithmConfig,
    [data],
  );

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-border/70 bg-surface p-6 shadow-sm">
        Loading algorithm configuration...
      </section>
    );
  }

  if (isError) {
    return (
      <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        {error instanceof Error
          ? error.message
          : "Unable to load algorithm config."}
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border/70 bg-surface p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c2652a]">
          Matching Algorithm
        </p>
        <h1 className="mt-2 text-4xl text-on-surface">
          Configure scoring weights
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-on-surface-variant sm:text-base">
          Adjust qualification, skill, experience, and preference weighting,
          then tune the qualification and skill gates. The save action is
          persisted to Prisma through the admin API.
        </p>
      </section>

      <AlgorithmConfigForm
        initialConfig={initialConfig}
        isSaving={saveMutation.isPending}
        onSave={(config) => saveMutation.mutate(config)}
      />
    </div>
  );
}

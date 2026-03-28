"use client";

import { useMemo } from "react";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
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
  const currentConfig = data ?? defaultAlgorithmConfig;
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

  const totalWeight =
    currentConfig.qualificationWeight +
    currentConfig.skillsWeight +
    currentConfig.experienceWeight +
    currentConfig.preferenceWeight;

  if (isLoading) {
    return (
      <section className="rounded-[2rem] border border-border/70 bg-surface p-6 shadow-sm">
        Loading algorithm configuration...
      </section>
    );
  }

  if (isError) {
    return (
      <section className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6 text-rose-700">
        {error instanceof Error
          ? error.message
          : "Unable to load algorithm config."}
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border/70 bg-surface p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#c2652a]">
              Matching Algorithm
            </p>
            <h1 className="text-4xl tracking-tight text-on-surface sm:text-5xl">
              Fine tune the engine that ranks seekers against live roles
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-on-surface-variant sm:text-base">
              Adjust the weighting model, qualification gates, and minimum skill
              overlap so the marketplace keeps producing reliable rankings.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:min-w-88">
            <MetricTile
              label="Weight total"
              value={`${totalWeight}%`}
              icon="check_circle"
              tone="text-[#c2652a] bg-[#c2652a]/10"
            />
            <MetricTile
              label="Minimum skill gate"
              value={`${currentConfig.minimumSkillMatchPercent}%`}
              icon="psychology"
              tone="text-emerald-700 bg-emerald-100"
            />
          </div>
        </div>
      </section>

      <AlgorithmConfigForm
        initialConfig={initialConfig}
        isSaving={saveMutation.isPending}
        onSave={(config) => saveMutation.mutate(config)}
      />

      {/* <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Qualification gate",
            value: currentConfig.strictQualification ? "Strict" : "Flexible",
            icon: currentConfig.strictQualification ? "verified" : "tune",
          },
          {
            label: "Overqualified",
            value: currentConfig.allowOverqualified ? "Allowed" : "Blocked",
            icon: "trending_up",
          },
          {
            label: "Underqualified",
            value: currentConfig.allowUnderqualified ? "Allowed" : "Blocked",
            icon: "trending_down",
          },
          {
            label: "Status",
            value: totalWeight === 100 ? "Balanced" : "Needs review",
            icon: totalWeight === 100 ? "check_circle" : "error",
          },
        ].map((tile) => (
          <article
            key={tile.label}
            className="rounded-[1.5rem] border border-border/70 bg-surface p-5 shadow-[0_12px_34px_rgba(58,48,42,0.05)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-on-surface-variant">
                  {tile.label}
                </p>
                <p className="mt-3 text-2xl tracking-tight text-on-surface">
                  {tile.value}
                </p>
              </div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <MaterialSymbol icon={tile.icon} className="text-[18px]" />
              </span>
            </div>
          </article>
        ))}
      </section> */}
    </div>
  );
}

function MetricTile({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: string;
  tone: string;
}) {
  return (
    <article className="rounded-[1.5rem] border border-border/70 bg-[#faf5ee] p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-on-surface-variant">
            {label}
          </p>
          <p className="mt-3 text-2xl tracking-tight text-on-surface">
            {value}
          </p>
        </div>
        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${tone}`}
        >
          <MaterialSymbol icon={icon} className="text-[18px]" />
        </span>
      </div>
    </article>
  );
}

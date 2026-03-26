"use client";

import { useEffect, useState } from "react";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { cn } from "@/lib/utils";
import type { AdminAlgorithmConfigInput } from "@/services/admin/types";

interface AlgorithmConfigFormProps {
  initialConfig: AdminAlgorithmConfigInput;
  isSaving?: boolean;
  onSave: (config: AdminAlgorithmConfigInput) => void;
}

type WeightKey =
  | "qualificationWeight"
  | "skillsWeight"
  | "experienceWeight"
  | "preferenceWeight";

const weightFields: Array<{
  key: WeightKey;
  label: string;
  description: string;
}> = [
  {
    key: "qualificationWeight",
    label: "Qualification Weight",
    description: "How heavily degrees and certifications influence rank.",
  },
  {
    key: "skillsWeight",
    label: "Skills Weight",
    description: "Weighting applied to direct and adjacent skill matches.",
  },
  {
    key: "experienceWeight",
    label: "Experience Weight",
    description: "Experience depth and title alignment impact.",
  },
  {
    key: "preferenceWeight",
    label: "Preference Weight",
    description: "Location, compensation, and role preference balance.",
  },
];

export function AlgorithmConfigForm({
  initialConfig,
  isSaving,
  onSave,
}: AlgorithmConfigFormProps) {
  const [config, setConfig] =
    useState<AdminAlgorithmConfigInput>(initialConfig);

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  const totalWeight =
    config.qualificationWeight +
    config.skillsWeight +
    config.experienceWeight +
    config.preferenceWeight;

  const isValid = totalWeight === 100;

  const updateWeight = (key: WeightKey, value: number) => {
    const nextValue = Number.isFinite(value)
      ? Math.max(0, Math.min(100, value))
      : 0;

    setConfig((current) => ({
      ...current,
      [key]: nextValue,
    }));
  };

  const handleSave = () => {
    onSave(config);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <section className="xl:col-span-2 rounded-3xl border border-border/70 bg-surface p-6 shadow-sm">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl text-on-surface">Global Weighting</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Adjust the scoring model that ranks seekers against open roles.
            </p>
          </div>
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold",
              isValid
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700",
            )}
          >
            <MaterialSymbol
              icon={isValid ? "check_circle" : "error"}
              className="text-base"
            />
            <span>Total: {totalWeight}%</span>
          </div>
        </div>

        <div className="space-y-6">
          {weightFields.map((field) => (
            <div
              key={field.key}
              className="rounded-2xl border border-border/70 bg-background/80 p-4"
            >
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <label className="text-sm font-semibold text-on-surface">
                    {field.label}
                  </label>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    {field.description}
                  </p>
                </div>
                <input
                  className="w-20 rounded-lg border border-border/70 bg-surface px-3 py-2 text-right text-sm outline-none focus:border-[#c2652a]"
                  max={100}
                  min={0}
                  onChange={(event) =>
                    updateWeight(field.key, Number(event.target.value))
                  }
                  type="number"
                  value={config[field.key]}
                />
              </div>
              <input
                className="w-full accent-[#c2652a]"
                max={100}
                min={0}
                onChange={(event) =>
                  updateWeight(field.key, Number(event.target.value))
                }
                type="range"
                value={config[field.key]}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6 rounded-3xl border border-border/70 bg-surface p-6 shadow-sm">
        <div>
          <h2 className="text-2xl text-on-surface">Rules</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Configure how strict the ranking engine should behave.
          </p>
        </div>

        <div className="space-y-4">
          <label className="flex items-start justify-between gap-4 rounded-2xl border border-border/70 bg-background/80 p-4">
            <span>
              <span className="block text-sm font-semibold text-on-surface">
                Strict Qualification
              </span>
              <span className="mt-1 block text-xs text-on-surface-variant">
                Enforce qualification as a hard gate before the rest of the
                scoring model is applied.
              </span>
            </span>
            <input
              checked={Boolean(config.strictQualification)}
              className="mt-1 h-5 w-5 accent-[#c2652a]"
              onChange={() =>
                setConfig((current) => ({
                  ...current,
                  strictQualification: !current.strictQualification,
                }))
              }
              type="checkbox"
            />
          </label>

          <label className="flex items-start justify-between gap-4 rounded-2xl border border-border/70 bg-background/80 p-4">
            <span>
              <span className="block text-sm font-semibold text-on-surface">
                Allow Overqualified
              </span>
              <span className="mt-1 block text-xs text-on-surface-variant">
                Keep strong candidates in the pool even when they exceed the
                role requirement.
              </span>
            </span>
            <input
              checked={Boolean(config.allowOverqualified)}
              className="mt-1 h-5 w-5 accent-[#c2652a]"
              onChange={() =>
                setConfig((current) => ({
                  ...current,
                  allowOverqualified: !current.allowOverqualified,
                }))
              }
              type="checkbox"
            />
          </label>

          <label className="flex items-start justify-between gap-4 rounded-2xl border border-border/70 bg-background/80 p-4">
            <span>
              <span className="block text-sm font-semibold text-on-surface">
                Allow Underqualified
              </span>
              <span className="mt-1 block text-xs text-on-surface-variant">
                Let candidates below the required qualification score keep a
                fallback score when strict qualification is relaxed.
              </span>
            </span>
            <input
              checked={Boolean(config.allowUnderqualified)}
              className="mt-1 h-5 w-5 accent-[#c2652a]"
              onChange={() =>
                setConfig((current) => ({
                  ...current,
                  allowUnderqualified: !current.allowUnderqualified,
                }))
              }
              type="checkbox"
            />
          </label>

          <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <span className="block text-sm font-semibold text-on-surface">
                  Minimum Skill Match Percent
                </span>
                <span className="mt-1 block text-xs text-on-surface-variant">
                  Skip skill scoring unless the candidate matches at least this
                  share of the required skills.
                </span>
              </div>
              <input
                className="w-20 rounded-lg border border-border/70 bg-surface px-3 py-2 text-right text-sm outline-none focus:border-[#c2652a]"
                max={100}
                min={0}
                onChange={(event) =>
                  setConfig((current) => ({
                    ...current,
                    minimumSkillMatchPercent: Math.max(
                      0,
                      Math.min(100, Number(event.target.value) || 0),
                    ),
                  }))
                }
                type="number"
                value={config.minimumSkillMatchPercent}
              />
            </div>
            <input
              className="w-full accent-[#c2652a]"
              max={100}
              min={0}
              onChange={(event) =>
                setConfig((current) => ({
                  ...current,
                  minimumSkillMatchPercent: Math.max(
                    0,
                    Math.min(100, Number(event.target.value) || 0),
                  ),
                }))
              }
              type="range"
              value={config.minimumSkillMatchPercent}
            />
          </div>

          <div className="rounded-2xl border border-border/70 bg-[#faf5ee] p-4 text-sm text-on-surface-variant">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#c2652a]">
              <MaterialSymbol icon="analytics" className="text-sm" />
              <span>Validation</span>
            </div>
            {isValid ? (
              <p>
                The current configuration is valid and ready to save.
                Deterministic matching will use the stored weights and rule
                flags.
              </p>
            ) : (
              <p className="text-rose-700">
                Weights must add up to 100%. Current total: {totalWeight}%.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-border/70 px-4 py-3 text-sm font-semibold text-on-surface transition-colors hover:border-[#c2652a] hover:text-[#c2652a]"
            onClick={() => setConfig(initialConfig)}
            type="button"
          >
            Reset changes
          </button>
          <button
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-colors",
              isValid
                ? "bg-[#c2652a] hover:bg-[#a9531c]"
                : "cursor-not-allowed bg-stone-400",
            )}
            disabled={!isValid || isSaving}
            onClick={handleSave}
            type="button"
          >
            <MaterialSymbol icon="save" className="text-base" />
            {isSaving ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </section>
    </div>
  );
}

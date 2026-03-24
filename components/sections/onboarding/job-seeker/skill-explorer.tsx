"use client";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { allSkills, skillSectors } from "@/utils/platform-data";

import { FilterChip } from "./filter-chip";

export function SkillExplorer({
  title,
  selectedSkills,
  skillQuery,
  onSkillQueryChange,
  activeSector,
  onActiveSectorChange,
  onToggleSkill,
  onQuickAddSkill,
  visibleSectors,
  visibleSkillsCount,
  compact = false,
}: {
  title: string;
  selectedSkills: string[];
  skillQuery: string;
  onSkillQueryChange: (value: string) => void;
  activeSector: string;
  onActiveSectorChange: (value: string) => void;
  onToggleSkill: (skill: string) => void;
  onQuickAddSkill: (skill: string) => void;
  visibleSectors: typeof skillSectors;
  visibleSkillsCount: number;
  compact?: boolean;
}) {
  const totalSkills = allSkills.length;

  return (
    <section className="space-y-4 rounded-[1.5rem] border border-outline-variant bg-surface-container-low p-4 lg:p-5">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
            {title}
          </p>
          <p className="mt-1 text-sm text-on-surface-variant">
            Browse {totalSkills}+ curated skills across {skillSectors.length}{" "}
            sectors.
          </p>
        </div>
        <div className="text-xs text-on-surface-variant">
          {visibleSkillsCount} skill{visibleSkillsCount === 1 ? "" : "s"}{" "}
          visible
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.4fr_0.6fr]">
        <label className="flex items-center gap-3 rounded-lg border border-outline-variant bg-surface px-4 py-3">
          <MaterialSymbol icon="search" className="text-[18px] text-outline" />
          <input
            value={skillQuery}
            onChange={(event) => onSkillQueryChange(event.target.value)}
            placeholder="Search skills, sectors, or specialties"
            className="w-full bg-transparent text-sm text-on-surface outline-none placeholder:text-outline"
          />
        </label>

        <button
          type="button"
          onClick={() => onSkillQueryChange("")}
          className="rounded-lg border border-outline-variant bg-surface px-4 py-3 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-low"
        >
          Clear search
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip
          label="All sectors"
          active={activeSector === "all"}
          onClick={() => onActiveSectorChange("all")}
        />
        {skillSectors.map((sector) => (
          <FilterChip
            key={sector.id}
            label={sector.label}
            active={activeSector === sector.id}
            onClick={() => onActiveSectorChange(sector.id)}
          />
        ))}
      </div>

      {selectedSkills.length > 0 ? (
        <div className="rounded-[1.25rem] border border-outline-variant bg-surface p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
            Selected skills
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedSkills.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => onToggleSkill(skill)}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                {skill}
                <MaterialSymbol icon="close" className="text-[14px]" />
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div
        className={
          compact ? "space-y-4" : "max-h-112 space-y-4 overflow-y-auto pr-1"
        }
      >
        {visibleSectors.map((sector) => (
          <article
            key={sector.id}
            className="rounded-[1.25rem] border border-outline-variant bg-surface p-4"
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-on-surface">
                  {sector.label}
                </h3>
                <p className="text-xs text-on-surface-variant">
                  {sector.description}
                </p>
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
                {sector.skills.length} skill
                {sector.skills.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {sector.skills.map((skill) => {
                const isSelected = selectedSkills.includes(skill);

                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => onToggleSkill(skill)}
                    className={`rounded-full border px-3.5 py-2 text-xs font-medium transition-all ${isSelected ? "border-primary bg-primary text-on-primary" : "border-outline-variant bg-surface-container-low text-on-surface hover:border-primary hover:text-primary"}`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {sector.skills.slice(0, 3).map((skill) => (
                <button
                  key={`${sector.id}-${skill}-quick`}
                  type="button"
                  onClick={() => onQuickAddSkill(skill)}
                  className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary transition-colors hover:text-primary/80"
                >
                  Add {skill}
                </button>
              ))}
            </div>
          </article>
        ))}

        {visibleSectors.length === 0 ? (
          <div className="rounded-[1.25rem] border border-dashed border-outline-variant bg-surface px-4 py-8 text-center text-sm text-on-surface-variant">
            No skills matched your search. Try a broader sector or clear the
            filter.
          </div>
        ) : null}
      </div>
    </section>
  );
}

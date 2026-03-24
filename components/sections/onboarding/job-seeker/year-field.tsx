"use client";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function YearField({
  label,
  year,
  onSelectYear,
}: {
  label: string;
  year?: number;
  onSelectYear: (year: number) => void;
}) {
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1950 + 6 },
    (_, index) => currentYear - index,
  );

  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-bold uppercase tracking-[0.28em] text-on-surface-variant">
        {label}
      </label>

      <Popover>
        <PopoverTrigger className="flex w-full items-center justify-between rounded-lg border border-outline-variant bg-surface px-4 py-3 text-left font-normal text-on-surface transition-colors hover:bg-surface-container-low">
          <span
            className={year ? "text-on-surface" : "text-on-surface-variant"}
          >
            {year ? String(year) : "Select a year"}
          </span>
          <MaterialSymbol
            icon="expand_more"
            className="text-[18px] text-outline"
          />
        </PopoverTrigger>
        <PopoverContent className="w-[18rem] bg-card p-3">
          <div className="max-h-72 overflow-y-auto pr-1">
            <div className="grid grid-cols-3 gap-2">
              {years.map((yearOption) => {
                const active = year === yearOption;

                return (
                  <button
                    key={yearOption}
                    type="button"
                    onClick={() => onSelectYear(yearOption)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${active ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface hover:bg-primary/10 hover:text-primary"}`}
                  >
                    {yearOption}
                  </button>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

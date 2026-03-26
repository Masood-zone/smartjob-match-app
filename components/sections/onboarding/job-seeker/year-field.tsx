"use client";

import { useMemo } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function YearField({
  label,
  year,
  onSelectYear,
  error,
}: {
  label: string;
  year?: number;
  onSelectYear: (year: number) => void;
  error?: string;
}) {
  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () =>
      Array.from(
        { length: currentYear - 1950 + 6 },
        (_, index) => currentYear - index,
      ),
    [currentYear],
  );

  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-bold uppercase tracking-[0.28em] text-on-surface-variant">
        {label}
      </label>

      <Select
        value={year ? String(year) : ""}
        onValueChange={(value) => onSelectYear(Number.parseInt(value, 10))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a year" />
        </SelectTrigger>
        <SelectContent className="max-h-[18rem] w-[18rem]">
          {years.map((yearOption) => (
            <SelectItem key={yearOption} value={String(yearOption)}>
              {yearOption}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

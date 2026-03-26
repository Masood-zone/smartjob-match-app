"use client";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MaterialSymbol } from "@/components/common/MaterialSymbol";

export function DateField({
  label,
  selected,
  onSelect,
  placeholder,
  hideLabel = false,
  error,
}: {
  label: string;
  selected?: Date;
  onSelect: (date?: Date) => void;
  placeholder: string;
  hideLabel?: boolean;
  error?: string;
}) {
  const formatted = selected ? formatDate(selected) : placeholder;

  return (
    <div className="space-y-2">
      {hideLabel ? null : (
        <label className="block text-[10px] font-bold uppercase tracking-[0.28em] text-on-surface-variant">
          {label}
        </label>
      )}

      <Popover>
        <PopoverTrigger className="flex w-full items-center gap-3 rounded-lg border border-outline-variant bg-surface px-4 py-3 text-left font-normal text-on-surface transition-colors hover:bg-surface-container-low">
          <MaterialSymbol
            icon="calendar_today"
            className="text-[18px] text-outline"
          />
          <span
            className={selected ? "text-on-surface" : "text-on-surface-variant"}
          >
            {formatted}
          </span>
        </PopoverTrigger>
        <PopoverContent className="bg-card p-0">
          <div className="p-2">
            <Calendar
              selected={selected}
              onSelect={onSelect}
              className="border-0 shadow-none"
            />
          </div>
        </PopoverContent>
      </Popover>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

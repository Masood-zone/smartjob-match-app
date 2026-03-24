"use client";

import * as React from "react";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { cn } from "@/lib/utils";

type CalendarProps = {
  selected?: Date;
  onSelect?: (date?: Date) => void;
  initialMonth?: Date;
  className?: string;
};

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function Calendar({
  selected,
  onSelect,
  initialMonth,
  className,
}: CalendarProps) {
  const [month, setMonth] = React.useState<Date>(
    initialMonth ?? selected ?? new Date(),
  );

  React.useEffect(() => {
    if (selected) {
      setMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
    }
  }, [selected]);

  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  const leadingEmptyCells = startOfMonth.getDay();
  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const dayNumber = index - leadingEmptyCells + 1;

    if (dayNumber < 1 || dayNumber > daysInMonth) {
      return null;
    }

    return new Date(month.getFullYear(), month.getMonth(), dayNumber, 12);
  });

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(month);

  return (
    <div
      className={cn(
        "w-76 rounded-2xl border border-outline-variant bg-card p-4 shadow-[0_18px_50px_rgba(58,48,42,0.18)]",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() =>
            setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
          }
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container-low"
        >
          <MaterialSymbol icon="chevron_left" className="text-[18px]" />
        </button>
        <div className="text-sm font-semibold text-on-surface">
          {monthLabel}
        </div>
        <button
          type="button"
          onClick={() =>
            setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
          }
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container-low"
        >
          <MaterialSymbol icon="chevron_right" className="text-[18px]" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-[0.24em] text-on-surface-variant">
        {weekdayLabels.map((label) => (
          <div key={label} className="py-1.5">
            {label}
          </div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          if (!date) {
            return <div key={index} className="h-9" />;
          }

          const isSelected =
            selected?.getFullYear() === date.getFullYear() &&
            selected?.getMonth() === date.getMonth() &&
            selected?.getDate() === date.getDate();

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => onSelect?.(date)}
              className={cn(
                "flex h-9 items-center justify-center rounded-full text-sm transition-colors",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "text-on-surface hover:bg-primary/10 hover:text-primary",
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

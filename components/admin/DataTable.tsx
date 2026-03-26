"use client";

import type { ReactNode } from "react";

import { cn, getInitials } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  accessor?: keyof T;
  render?: (row: T) => ReactNode;
  className?: string;
  mobileHidden?: boolean;
  align?: "left" | "center" | "right";
  isAction?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey?: (row: T, index: number) => string;
  emptyState?: string;
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  emptyState = "No records available.",
}: DataTableProps<T>) {
  if (!data.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 bg-background/80 p-8 text-center text-sm text-on-surface-variant">
        {emptyState}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-surface shadow-sm">
        <div className="hidden md:block">
          <table className="w-full border-collapse text-left">
            <thead className="bg-surface-container-low/70 text-xs uppercase tracking-[0.2em] text-on-surface-variant">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "px-5 py-4 font-semibold",
                      column.align === "center" && "text-center",
                      column.align === "right" && "text-right",
                      column.className,
                    )}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {data.map((row, index) => (
                <tr
                  key={rowKey?.(row, index) ?? String(index)}
                  className="transition-colors hover:bg-surface-container-low/40"
                >
                  {columns.map((column) => {
                    const cell = column.render
                      ? column.render(row)
                      : column.accessor
                        ? String(row[column.accessor] ?? "")
                        : null;

                    return (
                      <td
                        key={column.key}
                        className={cn(
                          "px-5 py-4 align-top text-sm text-on-surface",
                          column.align === "center" && "text-center",
                          column.align === "right" && "text-right",
                          column.className,
                        )}
                      >
                        {cell}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 p-4 md:hidden">
          {data.map((row, index) => {
            const key = rowKey?.(row, index) ?? String(index);
            const titleColumn =
              columns.find(
                (column) => !column.isAction && !column.mobileHidden,
              ) ?? columns[0];

            return (
              <article
                key={key}
                className="rounded-2xl border border-border/70 bg-background/90 p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.18em] text-on-surface-variant">
                      {titleColumn?.header}
                    </p>
                    <div className="text-sm font-semibold text-on-surface">
                      {titleColumn?.render
                        ? titleColumn.render(row)
                        : titleColumn?.accessor
                          ? String(row[titleColumn.accessor] ?? "")
                          : getInitials(String(index))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {columns
                    .filter(
                      (column) => !column.mobileHidden && !column.isAction,
                    )
                    .map((column) => {
                      const value = column.render
                        ? column.render(row)
                        : column.accessor
                          ? String(row[column.accessor] ?? "")
                          : null;

                      return (
                        <div
                          key={column.key}
                          className="flex items-start justify-between gap-4 text-sm"
                        >
                          <span className="text-on-surface-variant">
                            {column.header}
                          </span>
                          <span className="text-right text-on-surface">
                            {value}
                          </span>
                        </div>
                      );
                    })}
                  {columns.some((column) => column.isAction) ? (
                    <div className="pt-2">
                      {columns
                        .filter((column) => column.isAction)
                        .map((column) => (
                          <div key={column.key} className="flex justify-end">
                            {column.render ? column.render(row) : null}
                          </div>
                        ))}
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

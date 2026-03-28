"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { StatusBadge } from "./StatusBadge";

import { cn, formatDate, getInitials } from "@/lib/utils";
import {
  useAdminEmployersQuery,
  useUpdateAdminEmployerStatusMutation,
} from "@/services/admin/employers";

const filters = ["ALL", "PENDING", "APPROVED", "REJECTED"] as const;

type FilterValue = (typeof filters)[number];

export function EmployersView() {
  const {
    data: records = [],
    isLoading,
    isError,
    error,
  } = useAdminEmployersQuery();
  const updateStatusMutation = useUpdateAdminEmployerStatusMutation();
  const [filter, setFilter] = useState<FilterValue>("ALL");
  const [search, setSearch] = useState("");
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesFilter = filter === "ALL" ? true : record.status === filter;
      const normalizedSearch = search.trim().toLowerCase();
      const matchesSearch =
        !normalizedSearch ||
        record.companyName.toLowerCase().includes(normalizedSearch) ||
        record.industry.toLowerCase().includes(normalizedSearch) ||
        record.companyEmail.toLowerCase().includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [filter, records, search]);

  const selectedRecord =
    filteredRecords.find((record) => record.id === selectedRecordId) ??
    filteredRecords[0] ??
    records.find((record) => record.id === selectedRecordId) ??
    records[0] ??
    null;

  useEffect(() => {
    if (!filteredRecords.length) {
      setSelectedRecordId(null);
      return;
    }

    if (
      !selectedRecordId ||
      !filteredRecords.some((record) => record.id === selectedRecordId)
    ) {
      setSelectedRecordId(filteredRecords[0].id);
    }
  }, [filteredRecords, selectedRecordId]);

  const pendingCount = records.filter(
    (record) => record.status === "PENDING",
  ).length;

  if (isLoading) {
    return (
      <section className="rounded-[2rem] border border-border/70 bg-surface p-6 shadow-sm">
        Loading employers...
      </section>
    );
  }

  if (isError) {
    return (
      <section className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6 text-rose-700">
        {error instanceof Error ? error.message : "Unable to load employers."}
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border/70 bg-surface p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#c2652a]">
              Employer Verification
            </p>
            <h1 className="text-4xl tracking-tight text-on-surface sm:text-5xl">
              Validate company profiles with a clearer review rail
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-on-surface-variant sm:text-base">
              Review business registration data, uploaded documents, and the
              verification trail without a cramped two-column layout.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="rounded-full border border-border/70 bg-background px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant transition-colors hover:border-[#c2652a] hover:text-[#c2652a]">
              Export CSV
            </button>
            <button className="rounded-full bg-[#c2652a] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white shadow-sm">
              Batch Verify
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Total", value: records.length },
            { label: "Pending", value: pendingCount },
            {
              label: "Approved",
              value: records.filter((record) => record.status === "APPROVED")
                .length,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-[1.5rem] border border-border/70 bg-[#faf5ee]/70 p-4"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-on-surface-variant">
                {stat.label}
              </p>
              <p className="mt-2 text-3xl tracking-tight text-on-surface">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex-1">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
              Search
            </span>
            <input
              className="w-full rounded-[1.25rem] border border-border/70 bg-background px-4 py-3 text-sm outline-none placeholder:text-on-surface-variant/70 focus:border-[#c2652a]"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search companies, industries, or emails..."
              type="search"
              value={search}
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {filters.map((value) => (
              <button
                key={value}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                  filter === value
                    ? "border-[#c2652a] bg-[#c2652a] text-white"
                    : "border-border/70 bg-background text-on-surface-variant hover:border-[#c2652a] hover:text-[#c2652a]",
                )}
                onClick={() => setFilter(value)}
                type="button"
              >
                {value === "ALL"
                  ? "All statuses"
                  : value.charAt(0) + value.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <section className="overflow-hidden rounded-[2rem] border border-border/70 bg-surface shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-border/70 px-6 py-5">
            <div>
              <h2 className="text-2xl tracking-tight text-on-surface">
                Pending applications
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Select an employer to inspect documents and make a decision.
              </p>
            </div>
            <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
              {pendingCount} new
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-surface-container-low text-[10px] uppercase tracking-wider text-on-surface-variant">
                  <th className="px-6 py-4 font-semibold">Company</th>
                  <th className="px-6 py-4 font-semibold">Industry</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredRecords.length ? (
                  filteredRecords.map((record) => {
                    const isSelected = record.id === selectedRecord?.id;

                    return (
                      <tr
                        key={record.id}
                        className={cn(
                          "transition-colors",
                          isSelected
                            ? "bg-[#c2652a]/5"
                            : "hover:bg-surface-container-low/60",
                        )}
                      >
                        <td className="px-6 py-5">
                          <button
                            type="button"
                            onClick={() => setSelectedRecordId(record.id)}
                            className="flex items-center gap-3 text-left"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary-container text-sm font-bold text-primary">
                              {getInitials(record.companyName)}
                            </div>
                            <div>
                              <div className="font-semibold text-on-surface">
                                {record.companyName}
                              </div>
                              <div className="text-xs text-on-surface-variant">
                                {record.createdAt
                                  ? `Submitted ${formatDate(record.createdAt)}`
                                  : record.contactPerson}
                              </div>
                            </div>
                          </button>
                        </td>
                        <td className="px-6 py-5 text-sm text-on-surface-variant">
                          {record.industry}
                        </td>
                        <td className="px-6 py-5">
                          <StatusBadge status={record.status} />
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedRecordId(record.id)}
                            className="text-sm font-semibold text-[#c2652a] hover:underline"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-sm text-on-surface-variant"
                    >
                      No employers matched the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-border/70 px-6 py-4 text-center text-sm text-on-surface-variant">
            Showing {filteredRecords.length} of {records.length} employers
          </div>
        </section>

        <aside className="space-y-4 rounded-[2rem] border border-border/70 bg-surface p-6 shadow-sm">
          {selectedRecord ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[1.25rem] border border-border/70 bg-[#f4e8dd] text-lg font-bold text-[#c2652a]">
                    {selectedRecord.onboarding?.basicInfoData &&
                    typeof selectedRecord.onboarding.basicInfoData ===
                      "object" ? (
                      <span className="text-sm font-semibold">
                        {getInitials(selectedRecord.companyName)}
                      </span>
                    ) : (
                      <span>{getInitials(selectedRecord.companyName)}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-on-surface-variant">
                      Employer profile
                    </p>
                    <h2 className="text-3xl tracking-tight text-on-surface">
                      {selectedRecord.companyName}
                    </h2>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {selectedRecord.contactPerson} ·{" "}
                      {selectedRecord.companyEmail}
                    </p>
                  </div>
                </div>

                <StatusBadge status={selectedRecord.status} />
              </div>

              <div className="rounded-[1.5rem] border border-border/70 bg-[#faf5ee] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#c2652a]">
                  Description
                </p>
                <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                  {selectedRecord.summary}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Industry", selectedRecord.industry],
                  ["Location", selectedRecord.location],
                  ["Employees", selectedRecord.employeeRange],
                  ["Onboarding", selectedRecord.onboardingStatus],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-[1.25rem] border border-border/70 bg-background/80 p-4"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant">
                      {label}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-on-surface">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
                  <MaterialSymbol icon="description" className="text-sm" />
                  <span>Verification Documents</span>
                </div>
                <div className="space-y-3">
                  {selectedRecord.documents.length ? (
                    selectedRecord.documents.map((document) => (
                      <a
                        key={document.label}
                        className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-border/70 bg-background/90 p-4 transition-colors hover:border-[#c2652a] hover:bg-[#faf5ee]"
                        href={document.href}
                      >
                        <div>
                          <p className="text-sm font-semibold text-on-surface">
                            {document.label}
                          </p>
                          <p className="mt-1 text-xs text-on-surface-variant">
                            {document.meta}
                          </p>
                        </div>
                        <MaterialSymbol
                          icon="open_in_new"
                          className="text-lg text-on-surface-variant"
                        />
                      </a>
                    ))
                  ) : (
                    <div className="rounded-[1.25rem] border border-dashed border-border/70 bg-background/70 p-4 text-sm text-on-surface-variant">
                      No verification documents uploaded yet.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-border/70 bg-[#faf5ee] p-4 text-sm text-on-surface-variant">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c2652a]">
                  Submitted
                </p>
                <p className="mt-2 text-on-surface">
                  {formatDate(selectedRecord.createdAt)}
                </p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  Updated {formatDate(selectedRecord.updatedAt)}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() =>
                    updateStatusMutation.mutate({
                      id: selectedRecord.id,
                      status: "REJECTED",
                    })
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100"
                >
                  <MaterialSymbol icon="cancel" className="text-[18px]" />
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateStatusMutation.mutate({
                      id: selectedRecord.id,
                      status: "APPROVED",
                    })
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#c2652a] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#a9531c]"
                >
                  <MaterialSymbol icon="check_circle" className="text-[18px]" />
                  Approve
                </button>
              </div>
            </>
          ) : (
            <div className="flex h-112 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-border/70 bg-background/60 p-8 text-center text-on-surface-variant">
              <MaterialSymbol
                icon="business"
                className="text-4xl text-[#c2652a]"
              />
              <h3 className="mt-4 text-2xl tracking-tight text-on-surface">
                Pick an employer to review
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-7">
                Select a company from the queue to inspect its documents and
                verification summary.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

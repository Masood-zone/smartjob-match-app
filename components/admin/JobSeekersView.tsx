"use client";

import { useEffect, useMemo, useState } from "react";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { RejectionReasonModal } from "./RejectionReasonModal";
import { StatusBadge } from "./StatusBadge";

import { cn, formatDate, getInitials } from "@/lib/utils";
import {
  useAdminJobSeekersQuery,
  useUpdateAdminJobSeekerStatusMutation,
} from "@/services/admin/job-seekers";
import type { AdminJobSeekerRecord } from "@/services/admin/types";

const filters = ["ALL", "PENDING", "APPROVED", "REJECTED"] as const;

type FilterValue = (typeof filters)[number];

export function JobSeekersView() {
  const {
    data: records = [],
    isLoading,
    isError,
    error,
  } = useAdminJobSeekersQuery();
  const updateStatusMutation = useUpdateAdminJobSeekerStatusMutation();
  const [filter, setFilter] = useState<FilterValue>("ALL");
  const [search, setSearch] = useState("");
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [rejectionTarget, setRejectionTarget] =
    useState<AdminJobSeekerRecord | null>(null);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesFilter = filter === "ALL" ? true : record.status === filter;
      const normalizedSearch = search.trim().toLowerCase();
      const matchesSearch =
        !normalizedSearch ||
        record.fullName.toLowerCase().includes(normalizedSearch) ||
        record.email.toLowerCase().includes(normalizedSearch) ||
        record.qualification.toLowerCase().includes(normalizedSearch);

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

  const selectedRejectionReason = getRejectionReason(
    selectedRecord?.onboarding?.reviewData ?? null,
  );

  if (isLoading) {
    return (
      <section className="rounded-[2rem] border border-border/70 bg-surface p-6 shadow-sm">
        Loading job seekers...
      </section>
    );
  }

  if (isError) {
    return (
      <section className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6 text-rose-700">
        {error instanceof Error ? error.message : "Unable to load job seekers."}
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border/70 bg-surface p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#c2652a]">
              Seeker Verification
            </p>
            <h1 className="text-4xl tracking-tight text-on-surface sm:text-5xl">
              Review applicants in a calmer, split-panel workspace
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-on-surface-variant sm:text-base">
              Approve or reject verified job seekers while inspecting identity,
              qualification, skill signals, and work history on the right.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="rounded-full border border-border/70 bg-background px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant transition-colors hover:border-[#c2652a] hover:text-[#c2652a]">
              Filter seekers
            </button>
            <button className="rounded-full bg-[#c2652a] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white shadow-sm">
              Batch Review
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
              placeholder="Search seekers by name, email, or qualification..."
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
                Seeker queue
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Select an applicant to inspect profile completeness and make a
                decision.
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
                  <th className="px-6 py-4 font-semibold">Seeker</th>
                  <th className="px-6 py-4 font-semibold">Qualification</th>
                  <th className="px-6 py-4 font-semibold">Skills</th>
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
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-sm font-bold text-primary">
                              {getInitials(record.fullName)}
                            </div>
                            <div>
                              <div className="font-semibold text-on-surface">
                                {record.fullName}
                              </div>
                              <div className="text-xs text-on-surface-variant">
                                {record.email}
                              </div>
                            </div>
                          </button>
                        </td>
                        <td className="px-6 py-5 text-sm text-on-surface-variant">
                          {record.qualification}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-wrap gap-1.5">
                            {record.skills.slice(0, 2).map((skill) => (
                              <span
                                key={skill}
                                className="rounded-full border border-border/70 bg-[#faf5ee] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
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
                      colSpan={5}
                      className="px-6 py-12 text-center text-sm text-on-surface-variant"
                    >
                      No seekers matched the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-border/70 px-6 py-4 text-center text-sm text-on-surface-variant">
            Showing {filteredRecords.length} of {records.length} seekers
          </div>
        </section>

        <aside className="space-y-4 rounded-[2rem] border border-border/70 bg-surface p-6 shadow-sm">
          {selectedRecord ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[1.25rem] border border-border/70 bg-[#f4e8dd] text-lg font-bold text-[#c2652a]">
                    <span>{getInitials(selectedRecord.fullName)}</span>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-on-surface-variant">
                      Seeker profile
                    </p>
                    <h2 className="text-3xl tracking-tight text-on-surface">
                      {selectedRecord.fullName}
                    </h2>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {selectedRecord.email}
                    </p>
                  </div>
                </div>

                <StatusBadge status={selectedRecord.status} />
              </div>

              <div className="rounded-[1.5rem] border border-border/70 bg-[#faf5ee] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#c2652a]">
                  Summary
                </p>
                <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                  {selectedRecord.summary}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Qualification", selectedRecord.qualification],
                  ["Location", selectedRecord.location],
                  ["Institution", selectedRecord.institutionName],
                  ["Completion", selectedRecord.yearOfCompletion ?? "N/A"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-[1.25rem] border border-border/70 bg-background/80 p-4"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant">
                      {label}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-on-surface">
                      {String(value)}
                    </p>
                  </div>
                ))}
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
                  <MaterialSymbol icon="psychology" className="text-sm" />
                  <span>Skills & experience</span>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {selectedRecord.skills.length ? (
                      selectedRecord.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-border/70 bg-[#faf5ee] px-3 py-1 text-[11px] text-on-surface-variant"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full border border-border/70 bg-[#faf5ee] px-3 py-1 text-[11px] text-on-surface-variant">
                        No skills listed
                      </span>
                    )}
                  </div>

                  <div className="rounded-[1.25rem] border border-border/70 bg-background/90 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c2652a]">
                      Work timeline
                    </p>
                    <div className="mt-3 space-y-3">
                      {buildExperienceEntries(selectedRecord).length ? (
                        buildExperienceEntries(selectedRecord).map((entry) => (
                          <div
                            key={`${entry.jobTitle}-${entry.companyName}`}
                            className="rounded-2xl border border-border/60 bg-[#faf5ee] p-3"
                          >
                            <p className="text-sm font-semibold text-on-surface">
                              {entry.jobTitle}
                            </p>
                            <p className="text-xs text-on-surface-variant">
                              {entry.companyName}
                            </p>
                            {entry.description ? (
                              <p className="mt-2 text-xs leading-6 text-on-surface-variant">
                                {entry.description}
                              </p>
                            ) : null}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-on-surface-variant">
                          No experience entries recorded yet.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-border/70 bg-[#faf5ee] p-4 text-sm text-on-surface-variant">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c2652a]">
                  Joined
                </p>
                <p className="mt-2 text-on-surface">
                  {formatDate(selectedRecord.createdAt)}
                </p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  Updated {formatDate(selectedRecord.updatedAt)}
                </p>
              </div>

              {selectedRecord.status === "PENDING" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={updateStatusMutation.isPending}
                    onClick={() =>
                      updateStatusMutation.mutate({
                        id: selectedRecord.id,
                        status: "APPROVED",
                      })
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#c2652a] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#a9531c] disabled:cursor-not-allowed disabled:bg-[#c2652a]/60"
                  >
                    <MaterialSymbol
                      icon="check_circle"
                      className="text-[18px]"
                    />
                    {updateStatusMutation.isPending ? "Updating..." : "Approve"}
                  </button>
                  <button
                    type="button"
                    disabled={updateStatusMutation.isPending}
                    onClick={() => setRejectionTarget(selectedRecord)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <MaterialSymbol icon="cancel" className="text-[18px]" />
                    Reject
                  </button>
                </div>
              ) : (
                <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4 text-sm text-on-surface-variant">
                  This profile has already been reviewed. Approval buttons are
                  hidden after a decision is recorded.
                </div>
              )}

              {selectedRecord.status === "REJECTED" &&
              selectedRejectionReason ? (
                <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-600">
                    Rejection reason
                  </p>
                  <p className="mt-2 leading-7">{selectedRejectionReason}</p>
                </div>
              ) : null}
            </>
          ) : (
            <div className="flex h-full min-h-112 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-border/70 bg-background/60 p-8 text-center text-on-surface-variant">
              <MaterialSymbol
                icon="person_search"
                className="text-4xl text-[#c2652a]"
              />
              <h3 className="mt-4 text-2xl tracking-tight text-on-surface">
                Pick a seeker to review
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-7">
                Select a profile from the queue to inspect qualification,
                skills, and experience before deciding.
              </p>
            </div>
          )}
        </aside>
      </div>

      <RejectionReasonModal
        open={Boolean(rejectionTarget)}
        title="Reject job seeker"
        description="Add a clear reason so the seeker knows what to update before they resubmit their profile."
        submitLabel="Reject profile"
        onOpenChange={(open) => {
          if (!open) {
            setRejectionTarget(null);
          }
        }}
        onSubmit={(reason) => {
          if (!rejectionTarget) {
            return;
          }

          updateStatusMutation.mutate(
            {
              id: rejectionTarget.id,
              status: "REJECTED",
              reason,
            },
            {
              onSuccess: () => setRejectionTarget(null),
            },
          );
        }}
      />
    </div>
  );
}

function buildExperienceEntries(record: AdminJobSeekerRecord) {
  const onboardingExperience = record.onboarding?.experienceData;

  if (!Array.isArray(onboardingExperience)) {
    return [];
  }

  return onboardingExperience.map((entry) => {
    const experience = entry && typeof entry === "object" ? entry : {};

    return {
      jobTitle:
        typeof experience.jobTitle === "string" && experience.jobTitle.trim()
          ? experience.jobTitle.trim()
          : "Untitled role",
      companyName:
        typeof experience.companyName === "string" &&
        experience.companyName.trim()
          ? experience.companyName.trim()
          : "Company pending",
      description:
        typeof experience.description === "string"
          ? experience.description
          : "",
    };
  });
}

function getRejectionReason(
  reviewData: Record<string, unknown> | null | undefined,
) {
  if (!reviewData) {
    return null;
  }

  const reason = reviewData.rejectionReason;

  return typeof reason === "string" && reason.trim().length > 0
    ? reason.trim()
    : null;
}

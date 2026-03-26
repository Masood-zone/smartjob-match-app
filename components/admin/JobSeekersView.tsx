"use client";

import { useMemo, useState } from "react";

import { ActionButtons } from "./ActionButtons";
import { DataTable, type Column } from "./DataTable";
import { ReviewModal } from "./ReviewModal";
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
    records.find((record) => record.id === selectedRecordId) ?? null;

  const columns: Column<AdminJobSeekerRecord>[] = [
    {
      key: "name",
      header: "Name",
      render: (record) => (
        <div className="space-y-1">
          <div className="font-semibold text-on-surface">{record.fullName}</div>
          <div className="text-xs text-on-surface-variant">{record.email}</div>
        </div>
      ),
    },
    {
      key: "qualification",
      header: "Qualification",
      render: (record) => (
        <div className="space-y-1">
          <div>{record.qualification}</div>
          <div className="text-xs text-on-surface-variant">
            {record.location}
          </div>
        </div>
      ),
    },
    {
      key: "skills",
      header: "Skills",
      render: (record) => (
        <div className="flex flex-wrap gap-2">
          {record.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-border/70 bg-[#faf5ee] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant"
            >
              {skill}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (record) => <StatusBadge status={record.status} />,
      align: "center",
    },
    {
      key: "actions",
      header: "Actions",
      isAction: true,
      align: "right",
      render: (record) => (
        <ActionButtons
          onApprove={() =>
            updateStatusMutation.mutate({ id: record.id, status: "APPROVED" })
          }
          onReject={() =>
            updateStatusMutation.mutate({ id: record.id, status: "REJECTED" })
          }
          onView={() => {
            setSelectedRecordId(record.id);
          }}
        />
      ),
    },
  ];

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-border/70 bg-surface p-6 shadow-sm">
        Loading job seekers...
      </section>
    );
  }

  if (isError) {
    return (
      <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        {error instanceof Error ? error.message : "Unable to load job seekers."}
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border/70 bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c2652a]">
              Seeker Verification
            </p>
            <h1 className="text-4xl text-on-surface">
              Review and validate applicants
            </h1>
            <p className="text-sm text-on-surface-variant sm:text-base">
              Approve or reject verified job seekers and inspect profile details
              before the next matching pass.
            </p>
          </div>

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
                  ? "All Statuses"
                  : value.charAt(0) + value.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Total", value: records.length },
            {
              label: "Pending",
              value: records.filter((record) => record.status === "PENDING")
                .length,
            },
            {
              label: "Approved",
              value: records.filter((record) => record.status === "APPROVED")
                .length,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-border/70 bg-background/80 p-4"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-on-surface-variant">
                {stat.label}
              </p>
              <p className="mt-2 text-3xl text-on-surface">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
            Search
          </label>
          <input
            className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none placeholder:text-on-surface-variant/70 focus:border-[#c2652a]"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search seekers by name, email, or qualification..."
            type="search"
            value={search}
          />
        </div>
      </section>

      <DataTable
        columns={columns}
        data={filteredRecords}
        rowKey={(record) => record.id}
        emptyState="No seekers matched the current filters."
      />

      {selectedRecord ? (
        <ReviewModal
          details={[
            { label: "Email", value: selectedRecord.email },
            { label: "Qualification", value: selectedRecord.qualification },
            { label: "Location", value: selectedRecord.location },
            {
              label: "Institution",
              value: selectedRecord.institutionName,
            },
            { label: "Grade", value: selectedRecord.gradeLevel },
            {
              label: "Year of Completion",
              value: selectedRecord.yearOfCompletion ?? "N/A",
            },
            {
              label: "Skills",
              value: selectedRecord.skills.join(", ") || "None",
            },
            {
              label: "Experience Entries",
              value: selectedRecord.experienceCount,
            },
            { label: "Onboarding", value: selectedRecord.onboardingStatus },
            { label: "Joined", value: formatDate(selectedRecord.createdAt) },
          ]}
          initials={getInitials(selectedRecord.fullName)}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedRecordId(null);
            }
          }}
          open={Boolean(selectedRecordId)}
          status={selectedRecord.status}
          subtitle={selectedRecord.email}
          summary={selectedRecord.summary}
          title={selectedRecord.fullName}
        />
      ) : null}
    </div>
  );
}

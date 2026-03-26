"use client";

import { useMemo, useState } from "react";

import { ActionButtons } from "./ActionButtons";
import { DataTable, type Column } from "./DataTable";
import { ReviewModal } from "./ReviewModal";
import { StatusBadge } from "./StatusBadge";

import { cn, formatDate, getInitials } from "@/lib/utils";
import {
  useAdminEmployersQuery,
  useUpdateAdminEmployerStatusMutation,
} from "@/services/admin/employers";
import type { AdminEmployerRecord } from "@/services/admin/types";

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
    records.find((record) => record.id === selectedRecordId) ?? null;

  const columns: Column<AdminEmployerRecord>[] = [
    {
      key: "companyName",
      header: "Company",
      render: (record) => (
        <div className="space-y-1">
          <div className="font-semibold text-on-surface">
            {record.companyName}
          </div>
          <div className="text-xs text-on-surface-variant">
            {record.contactPerson}
          </div>
        </div>
      ),
    },
    {
      key: "industry",
      header: "Industry",
      render: (record) => (
        <div className="space-y-1">
          <div>{record.industry}</div>
          <div className="text-xs text-on-surface-variant">
            {record.location}
          </div>
        </div>
      ),
    },
    {
      key: "documents",
      header: "Documents",
      render: (record) => (
        <div className="space-y-1">
          <div className="text-sm font-semibold text-on-surface">
            {record.documents[0]?.label ?? "No documents"}
          </div>
          <div className="text-xs text-on-surface-variant">
            {record.documents[0]
              ? `${record.documents.length} file${record.documents.length > 1 ? "s" : ""} uploaded`
              : "Waiting for upload"}
          </div>
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
        Loading employers...
      </section>
    );
  }

  if (isError) {
    return (
      <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        {error instanceof Error ? error.message : "Unable to load employers."}
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border/70 bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c2652a]">
              Employer Verification
            </p>
            <h1 className="text-4xl text-on-surface">
              Validate company profiles
            </h1>
            <p className="text-sm text-on-surface-variant sm:text-base">
              Review business registration data, uploaded documents, and
              verification status before approval.
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
            placeholder="Search companies, industries, or emails..."
            type="search"
            value={search}
          />
        </div>
      </section>

      <DataTable
        columns={columns}
        data={filteredRecords}
        rowKey={(record) => record.id}
        emptyState="No employers matched the current filters."
      />

      {selectedRecord ? (
        <ReviewModal
          details={[
            { label: "Company Email", value: selectedRecord.companyEmail },
            { label: "Industry", value: selectedRecord.industry },
            { label: "Location", value: selectedRecord.location },
            { label: "Employee Range", value: selectedRecord.employeeRange },
            { label: "Contact Person", value: selectedRecord.contactPerson },
            { label: "Onboarding", value: selectedRecord.onboardingStatus },
            { label: "Submitted", value: formatDate(selectedRecord.createdAt) },
          ]}
          documents={selectedRecord.documents.map((document) => ({
            label: document.label,
            href: document.href,
            meta: document.meta,
          }))}
          initials={getInitials(selectedRecord.companyName)}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedRecordId(null);
            }
          }}
          open={Boolean(selectedRecordId)}
          status={selectedRecord.status}
          subtitle={selectedRecord.industry}
          summary={selectedRecord.summary}
          title={selectedRecord.companyName}
        />
      ) : null}
    </div>
  );
}

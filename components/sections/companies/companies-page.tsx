"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { useCompaniesQuery } from "@/services/companies";

function getCompanyInitials(companyName: string) {
  return companyName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function CompaniesPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, error, refetch } = useCompaniesQuery();

  const companies = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return data ?? [];
    }

    return (data ?? []).filter((company) => {
      return [
        company.companyName,
        company.industry,
        company.location,
        company.summary,
        company.teamFocus,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [data, search]);

  return (
    <main className="flex-1 bg-[radial-gradient(circle_at_top_right,rgba(240,168,120,0.18),transparent_28%),linear-gradient(180deg,#faf5ee_0%,#f8f1e7_100%)] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="mx-auto max-w-7xl space-y-8">
        <header className="overflow-hidden rounded-[2rem] border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_18px_50px_rgba(58,48,42,0.08)] sm:p-8 lg:p-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">
                Company directory
              </p>
              <h1 className="text-4xl tracking-tight text-on-surface sm:text-5xl">
                Approved employers ready for matching
              </h1>
              export { CompaniesBrowserPage as CompaniesPage } from "./companies-browser-page";
                Browse verified companies, inspect current openings, and jump

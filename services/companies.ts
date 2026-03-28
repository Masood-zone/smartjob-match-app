"use client";

import { useQuery } from "@tanstack/react-query";

import { useSession } from "@/lib/auth-client";
import { api, getAxiosErrorMessage } from "@/services/api/axios";

export interface CompanySummary {
  id: string;
  userId: string;
  companyName: string;
  companyEmail: string;
  industry: string;
  location: string;
  logoUrl: string | null;
  employeeRange: string;
  plannedHires: number | null;
  teamFocus: string;
  summary: string;
  jobsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyJobSummary {
  id: string;
  title: string;
  description: string;
  location: string;
  requiredQualification: string;
  requiredSkills: string[];
  applicationsCount: number;
  matchesCount: number;
  topMatchScore: number;
  topMatchType: string | null;
  createdAt: string;
}

export interface CompanyDetails extends CompanySummary {
  website: string;
  phoneNumber: string;
  address: string;
  documents: Array<{ label: string; href: string; meta: string }>;
  jobs: CompanyJobSummary[];
}

export const companiesQueryKey = ["companies"] as const;

function useAuthScope() {
  const { data: session } = useSession();

  return session?.user?.id ? `user:${session.user.id}` : "anonymous";
}

async function fetchCompanies(search?: string) {
  try {
    const response = await api.get<{ data: CompanySummary[] }>(
      "/api/companies",
      {
        params: search ? { search } : undefined,
      },
    );

    return response.data.data;
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error));
  }
}

async function fetchCompany(companyId: string) {
  try {
    const response = await api.get<{ data: CompanyDetails }>(
      `/api/companies/${companyId}`,
    );

    return response.data.data;
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error));
  }
}

export function useCompaniesQuery(search?: string) {
  const authScope = useAuthScope();

  return useQuery({
    queryKey: [...companiesQueryKey, authScope, search ?? "all"],
    queryFn: () => fetchCompanies(search),
    staleTime: 30_000,
  });
}

export function useCompanyQuery(companyId: string) {
  const authScope = useAuthScope();

  return useQuery({
    queryKey: [...companiesQueryKey, authScope, companyId],
    queryFn: () => fetchCompany(companyId),
    staleTime: 30_000,
    enabled: Boolean(companyId),
  });
}

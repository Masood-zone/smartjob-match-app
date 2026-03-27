"use client";

import { useQuery } from "@tanstack/react-query";

import { api, getAxiosErrorMessage } from "@/services/api/axios";

export interface EmployerDashboardJob {
  id: string;
  employerId: string;
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

export interface EmployerDashboardApplication {
  id: string;
  jobId: string;
  title: string;
  location: string;
  status: string;
  appliedAt: string;
  updatedAt: string;
  matchScore: number | null;
  matchType: string | null;
}

export interface EmployerDashboardMatch {
  id: string;
  jobId: string;
  title: string;
  location: string;
  score: number;
  matchType: string;
  seekerId: string;
  seeker: {
    id: string;
    userId: string;
    fullName: string;
    email: string;
    image: string | null;
    qualification: string;
    skills: string[];
    summary: string;
    location: string;
    experience: Array<{
      jobTitle: string;
      companyName: string;
      startDate: string | null;
      endDate: string | null;
      isCurrentRole: boolean;
      description: string;
    }>;
  };
}

export interface EmployerDashboardResponse {
  employer: {
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
    verificationStatus: string;
    onboardingStatus: string;
  };
  stats: {
    totalJobs: number;
    totalApplications: number;
    totalMatches: number;
    totalInterviews: number;
  };
  jobs: EmployerDashboardJob[];
  recentApplications: EmployerDashboardApplication[];
  topMatches: EmployerDashboardMatch[];
}

export const employerDashboardQueryKey = ["employer", "dashboard"] as const;

async function fetchEmployerDashboard() {
  try {
    const response = await api.get<{ data: EmployerDashboardResponse }>(
      "/api/employer/dashboard",
    );

    return response.data.data;
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error));
  }
}

export function useEmployerDashboardQuery() {
  return useQuery({
    queryKey: employerDashboardQueryKey,
    queryFn: fetchEmployerDashboard,
    staleTime: 30_000,
  });
}

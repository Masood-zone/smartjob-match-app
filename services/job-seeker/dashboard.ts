"use client";

import { useQuery } from "@tanstack/react-query";

import { useSession } from "@/lib/auth-client";
import { api, getAxiosErrorMessage } from "@/services/api/axios";

export interface JobSeekerDashboardSeeker {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  qualification: string;
  skills: string[];
  onboardingStatus: string;
  verificationStatus: string;
  rejectionReason: string | null;
}

export interface JobSeekerDashboardStats {
  totalApplications: number;
  matchesFound: number;
  notifications: number;
}

export interface JobSeekerDashboardRecentApplication {
  id: string;
  jobId: string;
  companyId: string;
  title: string;
  companyName: string;
  companyIndustry: string;
  companyLocation: string;
  companyLogoUrl: string | null;
  status: string;
  requiredQualification: string;
  requiredSkills: string[];
  location: string;
  appliedAt: string;
  updatedAt: string;
  interview: {
    id: string;
    date: string;
    location: string;
    notes: string | null;
  } | null;
}

export interface JobSeekerDashboardRecentMatch {
  id: string;
  jobId: string;
  companyId: string;
  title: string;
  companyName: string;
  companyIndustry: string;
  companyLocation: string;
  companyLogoUrl: string | null;
  score: number;
  matchType: string;
  requiredQualification: string;
  requiredSkills: string[];
  location: string;
  matchedAt: string;
}

export interface JobSeekerDashboardResponse {
  stats: JobSeekerDashboardStats;
  seeker: JobSeekerDashboardSeeker;
  recentApplications: JobSeekerDashboardRecentApplication[];
  recentMatches: JobSeekerDashboardRecentMatch[];
}

export const jobSeekerDashboardQueryKey = ["job-seeker", "dashboard"] as const;

function useAuthScope() {
  const { data: session } = useSession();

  return session?.user?.id ? `user:${session.user.id}` : "anonymous";
}

async function fetchJobSeekerDashboard() {
  try {
    const response = await api.get<JobSeekerDashboardResponse>(
      "/api/job-seeker/dashboard",
    );

    return response.data;
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error));
  }
}

export function useJobSeekerDashboardQuery() {
  const authScope = useAuthScope();

  return useQuery({
    queryKey: [...jobSeekerDashboardQueryKey, authScope],
    queryFn: fetchJobSeekerDashboard,
    staleTime: 30_000,
    enabled: authScope !== "anonymous",
  });
}

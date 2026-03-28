"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useSession } from "@/lib/auth-client";
import { api, getAxiosErrorMessage } from "@/services/api/axios";

import { companiesQueryKey } from "./companies";
import { jobSeekerDashboardQueryKey } from "./job-seeker/dashboard";

export interface JobRecord {
  id: string;
  employerId: string;
  title: string;
  description: string;
  location: string;
  requiredQualification: string;
  requiredSkills: string[];
  companyName: string;
  companyEmail: string;
  companyIndustry: string;
  companyLocation: string;
  companyLogoUrl: string | null;
  applicationsCount: number;
  matchesCount: number;
  topMatchScore: number;
  topMatchType: string | null;
  createdAt: string;
}

export interface CreateJobInput {
  title: string;
  description: string;
  location: string;
  requiredQualification: string;
  requiredSkills: string[];
}

export interface JobApplicantSeeker {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  image: string | null;
  qualification: string;
  skills: string[];
  summary: string;
  location: string;
  profile?: {
    headline: string;
    summary: string;
    locationMode: string;
    locationLabel: string;
    currentRole: string;
    currentCompany: string;
    experience: Array<{
      jobTitle: string;
      companyName: string;
      startDate: string | null;
      endDate: string | null;
      isCurrentRole: boolean;
      description: string;
    }>;
    education: {
      institutionName: string;
      qualification: string;
      gradeLevel: string;
      yearOfCompletion: string;
    } | null;
    notes: string;
  };
}

export interface JobApplicantRecord {
  id: string;
  jobId: string;
  seekerId: string;
  status: string;
  appliedAt: string;
  updatedAt: string;
  interview: {
    id: string;
    date: string;
    location: string;
    notes: string | null;
  } | null;
  matchScore: number | null;
  matchType: string | null;
  seeker: JobApplicantSeeker;
}

export interface JobApplicantsResponse {
  data: JobApplicantRecord[];
  job: {
    id: string;
    title: string;
  };
}

export interface JobApplicantsSummary {
  id: string;
  title: string;
  location: string;
  requiredQualification: string;
  requiredSkills: string[];
  applicationsCount: number;
  matchesCount: number;
  topMatchScore: number;
  topMatchType: string | null;
}

export const jobsQueryKey = ["jobs"] as const;

function useAuthScope() {
  const { data: session } = useSession();

  return session?.user?.id ? `user:${session.user.id}` : "anonymous";
}

async function fetchJobs(params?: {
  employerId?: string;
  companyId?: string;
  query?: string;
}) {
  try {
    const response = await api.get<{ data: JobRecord[] }>("/api/jobs", {
      params: params ?? undefined,
    });

    return response.data.data;
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error));
  }
}

async function createJob(input: CreateJobInput) {
  try {
    const response = await api.post<{ data: Record<string, unknown> }>(
      "/api/jobs",
      input,
    );

    return response.data.data;
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error));
  }
}

async function fetchJobApplicants(jobId: string) {
  try {
    const response = await api.get<JobApplicantsResponse>(
      `/api/jobs/${jobId}/applicants`,
    );

    return response.data;
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error));
  }
}

export function useJobsQuery(params?: {
  employerId?: string;
  companyId?: string;
  query?: string;
}) {
  const authScope = useAuthScope();

  return useQuery({
    queryKey: [...jobsQueryKey, authScope, params ?? "all"],
    queryFn: () => fetchJobs(params),
    staleTime: 20_000,
  });
}

export function useCreateJobMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createJob,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: jobsQueryKey }),
        queryClient.invalidateQueries({ queryKey: companiesQueryKey }),
        queryClient.invalidateQueries({ queryKey: jobSeekerDashboardQueryKey }),
      ]);
    },
  });
}

export function useJobApplicantsQuery(jobId: string) {
  return useQuery({
    queryKey: [...jobsQueryKey, jobId, "applicants"],
    queryFn: () => fetchJobApplicants(jobId),
    staleTime: 20_000,
    enabled: Boolean(jobId),
  });
}

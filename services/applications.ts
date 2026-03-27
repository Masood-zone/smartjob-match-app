"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, getAxiosErrorMessage } from "@/services/api/axios";

import { jobSeekerDashboardQueryKey } from "./job-seeker/dashboard";
import { jobsQueryKey } from "./jobs";

export const applicationQueryKey = ["application"] as const;

export interface ApplyToJobResponse {
  data: {
    id: string;
    jobId: string;
    seekerId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  created: boolean;
  match: {
    score: number;
    matchType: string;
    matchedSkills: string[];
    missingSkills: string[];
    components: Record<string, number>;
  };
}

export interface UpdateApplicationStatusInput {
  applicationId: string;
  status: "ACCEPTED" | "REJECTED";
}

export interface ApplicationDetailResponse {
  data: {
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
    job: {
      id: string;
      title: string;
      location: string;
      requiredQualification: string;
      requiredSkills: string[];
    };
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
    };
  };
}

async function applyToJob(jobId: string) {
  try {
    const response = await api.post<ApplyToJobResponse>("/api/applications", {
      jobId,
    });

    return response.data;
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error));
  }
}

async function updateApplicationStatus(input: UpdateApplicationStatusInput) {
  try {
    const response = await api.patch<{ ok: boolean; data: unknown }>(
      `/api/applications/${input.applicationId}`,
      { status: input.status },
    );

    return response.data;
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error));
  }
}

async function fetchApplication(applicationId: string) {
  try {
    const response = await api.get<ApplicationDetailResponse>(
      `/api/applications/${applicationId}`,
    );

    return response.data.data;
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error));
  }
}

export function useApplicationQuery(applicationId: string) {
  return useQuery({
    queryKey: [...applicationQueryKey, applicationId],
    queryFn: () => fetchApplication(applicationId),
    staleTime: 20_000,
    enabled: Boolean(applicationId),
  });
}

export function useApplyToJobMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: applyToJob,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: jobSeekerDashboardQueryKey }),
        queryClient.invalidateQueries({ queryKey: jobsQueryKey }),
      ]);
    },
  });
}

export function useUpdateApplicationStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateApplicationStatus,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: jobsQueryKey }),
        queryClient.invalidateQueries({ queryKey: jobSeekerDashboardQueryKey }),
        queryClient.invalidateQueries({ queryKey: applicationQueryKey }),
        queryClient.invalidateQueries({ queryKey: applicationQueryKey }),
      ]);
    },
  });
}

"use client";

import { useQuery } from "@tanstack/react-query";

import { api, getAxiosErrorMessage } from "@/services/api/axios";

export interface RankedMatchRecord {
  id: string;
  jobId: string;
  seekerId: string;
  score: number;
  matchType: string;
  title: string;
  location: string;
  requiredQualification: string;
  seeker: {
    id: string;
    userId: string;
    fullName: string;
    email: string;
    qualification: string;
    skills: string[];
    summary: string;
  };
  applicationStatus: string | null;
  appliedAt: string | null;
  createdAt: string;
}

export const matchesQueryKey = ["matches"] as const;

async function fetchMatches(jobId: string) {
  try {
    const response = await api.get<{ data: RankedMatchRecord[] }>(
      "/api/matches",
      {
        params: { jobId },
      },
    );

    return response.data.data;
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error));
  }
}

export function useJobMatchesQuery(jobId: string) {
  return useQuery({
    queryKey: [...matchesQueryKey, jobId],
    queryFn: () => fetchMatches(jobId),
    staleTime: 20_000,
    enabled: Boolean(jobId),
  });
}

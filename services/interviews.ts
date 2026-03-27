"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api, getAxiosErrorMessage } from "@/services/api/axios";

import { applicationQueryKey } from "./applications";
import { jobSeekerDashboardQueryKey } from "./job-seeker/dashboard";
import { jobsQueryKey } from "./jobs";
import { matchesQueryKey } from "./matches";

export interface ScheduleInterviewInput {
  applicationId: string;
  date: string;
  location: string;
  notes?: string;
}

async function scheduleInterview(input: ScheduleInterviewInput) {
  try {
    const response = await api.post<{ ok: boolean; data: unknown }>(
      "/api/interviews",
      input,
    );

    return response.data;
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error));
  }
}

export function useScheduleInterviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: scheduleInterview,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: jobsQueryKey }),
        queryClient.invalidateQueries({ queryKey: matchesQueryKey }),
        queryClient.invalidateQueries({ queryKey: jobSeekerDashboardQueryKey }),
        queryClient.invalidateQueries({ queryKey: applicationQueryKey }),
      ]);
    },
  });
}

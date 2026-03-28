"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, getAxiosErrorMessage } from "@/services/api/axios";

import { adminDashboardQueryKey } from "./dashboard";
import type { AdminJobSeekerRecord, AdminVerificationStatus } from "./types";

export const adminJobSeekersQueryKey = ["admin", "job-seekers"] as const;

async function fetchAdminJobSeekers() {
  try {
    const response = await api.get<{ data: AdminJobSeekerRecord[] }>(
      "/api/admin/job-seekers",
    );

    return response.data.data;
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error));
  }
}

async function updateAdminJobSeekerStatus(input: {
  id: string;
  status: AdminVerificationStatus;
  reason?: string;
}) {
  try {
    const response = await api.patch<{ ok: boolean }>(
      `/api/admin/job-seekers/${input.id}`,
      { status: input.status, reason: input.reason },
    );

    return response.data;
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error));
  }
}

export function useAdminJobSeekersQuery() {
  return useQuery({
    queryKey: adminJobSeekersQueryKey,
    queryFn: fetchAdminJobSeekers,
    staleTime: 30_000,
  });
}

export function useUpdateAdminJobSeekerStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAdminJobSeekerStatus,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminJobSeekersQueryKey }),
        queryClient.invalidateQueries({ queryKey: adminDashboardQueryKey }),
      ]);
    },
  });
}

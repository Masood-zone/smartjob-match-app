"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, getAxiosErrorMessage } from "@/services/api/axios";

import { adminDashboardQueryKey } from "./dashboard";
import type { AdminEmployerRecord, AdminVerificationStatus } from "./types";

export const adminEmployersQueryKey = ["admin", "employers"] as const;

async function fetchAdminEmployers() {
  try {
    const response = await api.get<{ data: AdminEmployerRecord[] }>(
      "/api/admin/employers",
    );

    return response.data.data;
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error));
  }
}

async function updateAdminEmployerStatus(input: {
  id: string;
  status: AdminVerificationStatus;
  reason?: string;
}) {
  try {
    const response = await api.patch<{ ok: boolean }>(
      `/api/admin/employers/${input.id}`,
      { status: input.status, reason: input.reason },
    );

    return response.data;
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error));
  }
}

export function useAdminEmployersQuery() {
  return useQuery({
    queryKey: adminEmployersQueryKey,
    queryFn: fetchAdminEmployers,
    staleTime: 30_000,
  });
}

export function useUpdateAdminEmployerStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAdminEmployerStatus,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminEmployersQueryKey }),
        queryClient.invalidateQueries({ queryKey: adminDashboardQueryKey }),
      ]);
    },
  });
}

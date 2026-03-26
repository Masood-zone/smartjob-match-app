"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, getAxiosErrorMessage } from "@/services/api/axios";

import type { AdminAlgorithmConfig, AdminAlgorithmConfigInput } from "./types";

export const adminAlgorithmQueryKey = ["admin", "algorithm"] as const;

async function fetchAdminAlgorithmConfig() {
  try {
    const response = await api.get<{ data: AdminAlgorithmConfig | null }>(
      "/api/admin/algorithm",
    );

    return response.data.data;
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error));
  }
}

async function saveAdminAlgorithmConfig(input: AdminAlgorithmConfigInput) {
  try {
    const response = await api.post<{ data: AdminAlgorithmConfig }>(
      "/api/admin/algorithm",
      input,
    );

    return response.data.data;
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error));
  }
}

export function useAdminAlgorithmConfigQuery() {
  return useQuery({
    queryKey: adminAlgorithmQueryKey,
    queryFn: fetchAdminAlgorithmConfig,
    staleTime: 30_000,
  });
}

export function useSaveAdminAlgorithmConfigMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveAdminAlgorithmConfig,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminAlgorithmQueryKey });
    },
  });
}

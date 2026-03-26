"use client";

import { useQuery } from "@tanstack/react-query";

import { api, getAxiosErrorMessage } from "@/services/api/axios";

import type { AdminDashboardResponse } from "./types";

export const adminDashboardQueryKey = ["admin", "dashboard"] as const;

async function fetchAdminDashboard() {
  try {
    const response = await api.get<AdminDashboardResponse>(
      "/api/admin/dashboard",
    );
    return response.data;
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error));
  }
}

export function useAdminDashboardQuery() {
  return useQuery({
    queryKey: adminDashboardQueryKey,
    queryFn: fetchAdminDashboard,
    staleTime: 30_000,
  });
}

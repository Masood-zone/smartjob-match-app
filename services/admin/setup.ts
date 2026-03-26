"use client";

import { useMutation } from "@tanstack/react-query";

import { api } from "@/services/api/axios";

export interface AdminSetupInput {
  email: string;
  name?: string;
}

async function setupAdmin(input: AdminSetupInput) {
  const response = await api.post<{ ok: boolean; user: unknown }>(
    "/api/admin/setup",
    input,
  );

  return response.data;
}

export function useAdminSetupMutation() {
  return useMutation({
    mutationFn: setupAdmin,
  });
}

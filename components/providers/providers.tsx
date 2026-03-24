"use client";

import { ReactNode } from "react";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { Analytics } from "@vercel/analytics/next";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Root providers component
 * Wraps the entire application with necessary context providers
 * - ThemeProvider: Manages dark/light mode (done)
 * - Toaster: Toast notifications (done)
 * - QueryClientProvider: React Query for data fetching and caching (done)
 * - Future: Authentication, Analytics, etc.
 */
const queryClient = new QueryClient();

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* <Analytics /> */}
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}

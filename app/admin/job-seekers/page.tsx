import type { Metadata } from "next";

import { AccessDenied } from "@/components/admin/AccessDenied";
import { JobSeekersView } from "@/components/admin/JobSeekersView";
import { isAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Job Seeker Verification",
};

export default function AdminJobSeekersPage() {
  const currentUser = { id: "admin-mock", name: "Admin User", role: "ADMIN" };

  if (!isAdmin(currentUser)) {
    return <AccessDenied />;
  }

  return <JobSeekersView />;
}

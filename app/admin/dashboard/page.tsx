import type { Metadata } from "next";

import { AccessDenied } from "@/components/admin/AccessDenied";
import { DashboardView } from "@/components/admin/DashboardView";
import { isAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default function AdminDashboardPage() {
  const currentUser = { id: "admin-mock", name: "Admin User", role: "ADMIN" };

  if (!isAdmin(currentUser)) {
    return <AccessDenied />;
  }

  return <DashboardView />;
}

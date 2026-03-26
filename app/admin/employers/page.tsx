import type { Metadata } from "next";

import { AccessDenied } from "@/components/admin/AccessDenied";
import { EmployersView } from "@/components/admin/EmployersView";
import { isAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Employer Verification",
};

export default function AdminEmployersPage() {
  const currentUser = { id: "admin-mock", name: "Admin User", role: "ADMIN" };

  if (!isAdmin(currentUser)) {
    return <AccessDenied />;
  }

  return <EmployersView />;
}

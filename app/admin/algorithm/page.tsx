import type { Metadata } from "next";

import { AccessDenied } from "@/components/admin/AccessDenied";
import { AlgorithmView } from "@/components/admin/AlgorithmView";
import { isAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Algorithm Configuration",
};

export default function AdminAlgorithmPage() {
  const currentUser = { id: "admin-mock", name: "Admin User", role: "ADMIN" };

  if (!isAdmin(currentUser)) {
    return <AccessDenied />;
  }

  return <AlgorithmView />;
}

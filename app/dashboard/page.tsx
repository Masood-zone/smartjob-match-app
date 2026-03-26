import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { auth } from "../../lib/auth";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  const role = session?.user?.role?.toUpperCase();

  if (role === "EMPLOYER") {
    redirect("/onboarding/employer/dashboard");
  }

  if (role === "ADMIN") {
    redirect("/onboarding/employer/dashboard");
  }

  redirect("/onboarding/job-seeker/dashboard");
}

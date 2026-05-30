import { SessionUser } from "@/components/sections/home/session-avatar-badge";

function getUserInitials(name?: string | null) {
  if (!name) {
    return "U";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getRoleLabel(role?: SessionUser["role"]) {
  if (role === "EMPLOYER") {
    return "Employer Account";
  }

  if (role === "JOB_SEEKER") {
    return "Job Seeker Account";
  }

  if (role === "ADMIN") {
    return "Admin Account";
  }

  return "User";
}

function getDashboardHref(role?: SessionUser["role"]) {
  if (role === "EMPLOYER") {
    return "/onboarding/employer/dashboard";
  }

  if (role === "JOB_SEEKER") {
    return "/onboarding/job-seeker/dashboard";
  }

  return "/onboarding";
}

export { getUserInitials, getRoleLabel, getDashboardHref };

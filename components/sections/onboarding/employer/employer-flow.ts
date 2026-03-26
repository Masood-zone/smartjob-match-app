export const employerFlowSteps = [
  { key: "welcome", label: "Welcome", href: "/onboarding/employer/welcome" },
  {
    key: "basic-info",
    label: "Company Info",
    href: "/onboarding/employer/basic-info",
  },
  {
    key: "verification",
    label: "Verification",
    href: "/onboarding/employer/verification",
  },
  {
    key: "team-setup",
    label: "Team Setup",
    href: "/onboarding/employer/team-setup",
  },
  { key: "review", label: "Review", href: "/onboarding/employer/review" },
  { key: "success", label: "Success", href: "/onboarding/employer/success" },
] as const;

export type EmployerFlowStepKey = (typeof employerFlowSteps)[number]["key"];

export function getEmployerStepIndex(stepKey: EmployerFlowStepKey) {
  return employerFlowSteps.findIndex((step) => step.key === stepKey);
}

export function getEmployerStepHref(stepKey: EmployerFlowStepKey) {
  return (
    employerFlowSteps.find((step) => step.key === stepKey)?.href ??
    "/onboarding/employer/welcome"
  );
}

export const employerRoutes = {
  welcome: "/onboarding/employer/welcome",
  basicInfo: "/onboarding/employer/basic-info",
  verification: "/onboarding/employer/verification",
  teamSetup: "/onboarding/employer/team-setup",
  review: "/onboarding/employer/review",
  success: "/onboarding/employer/success",
  dashboard: "/onboarding/employer/dashboard",
} as const;

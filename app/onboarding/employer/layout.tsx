import { EmployerOnboardingGate } from "@/components/sections/onboarding/employer/employer-onboarding-gate";

export default function EmployerOnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <EmployerOnboardingGate>{children}</EmployerOnboardingGate>;
}

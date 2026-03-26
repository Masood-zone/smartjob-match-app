export const employerOnboardingStepKeys = [
  "welcome",
  "basic-info",
  "verification",
  "team-setup",
  "review",
] as const;

export type EmployerOnboardingStepKey =
  (typeof employerOnboardingStepKeys)[number];

export type EmployerWorkMode = "ONSITE" | "HYBRID" | "REMOTE";

export type EmployerOnboardingValues = {
  accountEmail: string;
  companyName: string;
  companyEmail: string;
  phoneNumber: string;
  website: string;
  industry: string;
  country: string;
  city: string;
  address: string;
  businessDescription: string;
  businessRegistrationName: string;
  businessRegistrationUrl: string;
  businessRegistrationPublicId: string;
  currentTeamSize: number;
  plannedHires: number;
  teamFocus: string;
  workMode: EmployerWorkMode;
  accepted: boolean;
};

export const employerOnboardingDefaultValues: EmployerOnboardingValues = {
  accountEmail: "",
  companyName: "",
  companyEmail: "",
  phoneNumber: "",
  website: "",
  industry: "",
  country: "Ghana",
  city: "Accra",
  address: "",
  businessDescription: "",
  businessRegistrationName: "",
  businessRegistrationUrl: "",
  businessRegistrationPublicId: "",
  currentTeamSize: 5,
  plannedHires: 3,
  teamFocus: "Operations, talent, and growth",
  workMode: "HYBRID",
  accepted: false,
};

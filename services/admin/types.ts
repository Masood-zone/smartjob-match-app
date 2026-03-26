export type AdminVerificationStatus = "PENDING" | "APPROVED" | "REJECTED";
export type AdminOnboardingStatus = "IN_PROGRESS" | "COMPLETED";

export interface AdminDashboardStats {
  totalUsers: number;
  pendingVerifications: number;
  jobsCount: number;
  activeEmployers: number;
}

export interface AdminDashboardAnalytics {
  months: string[];
  seekerSeries: number[];
  employerSeries: number[];
  matchSuccess: number;
}

export interface AdminRecentActivity {
  id: string;
  title: string;
  description: string;
  occurredAt: string;
  status: string;
  icon: string;
  tone: "primary" | "green" | "amber" | "slate";
}

export interface AdminDashboardResponse {
  stats: AdminDashboardStats;
  analytics: AdminDashboardAnalytics;
  recentActivity: AdminRecentActivity[];
}

export interface AdminJobSeekerOnboardingDetails {
  id: string;
  currentStep: number;
  currentStepKey: string;
  status: AdminOnboardingStatus;
  verificationStatus: AdminVerificationStatus;
  completedAt: string | null;
  updatedAt: string;
  identityData: Record<string, unknown> | null;
  experienceData: Record<string, unknown> | null;
  qualificationData: Record<string, unknown> | null;
  reviewData: Record<string, unknown> | null;
}

export interface AdminJobSeekerRecord {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  qualification: string;
  skills: string[];
  status: AdminVerificationStatus;
  onboardingStatus: AdminOnboardingStatus;
  location: string;
  institutionName: string;
  gradeLevel: string;
  yearOfCompletion: number | null;
  summary: string;
  experienceCount: number;
  createdAt: string;
  updatedAt: string;
  onboarding: AdminJobSeekerOnboardingDetails | null;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
}

export interface AdminEmployerOnboardingDetails {
  id: string;
  currentStep: number;
  currentStepKey: string;
  status: AdminOnboardingStatus;
  verificationStatus: AdminVerificationStatus;
  completedAt: string | null;
  updatedAt: string;
  basicInfoData: Record<string, unknown> | null;
  verificationData: Record<string, unknown> | null;
  teamSetupData: Record<string, unknown> | null;
  reviewData: Record<string, unknown> | null;
}

export interface AdminEmployerDocument {
  label: string;
  href: string;
  meta: string;
}

export interface AdminEmployerRecord {
  id: string;
  userId: string;
  companyName: string;
  companyEmail: string;
  industry: string;
  status: AdminVerificationStatus;
  onboardingStatus: AdminOnboardingStatus;
  location: string;
  employeeRange: string;
  contactPerson: string;
  summary: string;
  documents: AdminEmployerDocument[];
  createdAt: string;
  updatedAt: string;
  onboarding: AdminEmployerOnboardingDetails | null;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
}

export interface AdminAlgorithmConfig {
  id: string;
  qualificationWeight: number;
  skillsWeight: number;
  experienceWeight: number;
  preferenceWeight: number;
  strictQualification: boolean;
  allowOverqualified: boolean;
  allowUnderqualified: boolean;
  minimumSkillMatchPercent: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAlgorithmConfigInput {
  id?: string;
  qualificationWeight: number;
  skillsWeight: number;
  experienceWeight: number;
  preferenceWeight: number;
  strictQualification: boolean;
  allowOverqualified: boolean;
  allowUnderqualified: boolean;
  minimumSkillMatchPercent: number;
}

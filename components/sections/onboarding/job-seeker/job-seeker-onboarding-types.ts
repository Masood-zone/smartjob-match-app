import type { QualificationLevelOption } from "@/utils/platform-data";

export type JobSeekerQualification = QualificationLevelOption["value"];

export const jobSeekerOnboardingStepKeys = [
  "identity",
  "experience",
  "qualifications",
  "review",
] as const;

export type JobSeekerOnboardingStepKey =
  (typeof jobSeekerOnboardingStepKeys)[number];

export type ExperienceEntry = {
  jobTitle: string;
  companyName: string;
  startDate?: Date;
  endDate?: Date;
  isCurrentRole: boolean;
  description: string;
};

export type JobSeekerOnboardingValues = {
  firstName: string;
  lastName: string;
  email: string;
  qualification: JobSeekerQualification;
  locationMode: "REMOTE" | "PART_TIME" | "SPECIFIC_LOCATION";
  locationRegion: string;
  locationCity: string;
  skills: string[];
  experience: ExperienceEntry[];
  institutionName: string;
  yearOfCompletion?: number;
  gradeLevel?: string;
  accepted: boolean;
};

export const jobSeekerOnboardingDefaultValues: JobSeekerOnboardingValues = {
  firstName: "",
  lastName: "",
  email: "",
  qualification: "DEGREE",
  locationMode: "SPECIFIC_LOCATION",
  locationRegion: "Greater Accra",
  locationCity: "Accra",
  skills: ["Product Design", "Web Development", "Data Analysis"],
  experience: [
    {
      jobTitle: "Senior Brand Designer",
      companyName: "Sahara Studio",
      startDate: new Date(2022, 7, 1),
      endDate: undefined,
      isCurrentRole: true,
      description:
        "Led visual identity work, collaborated with product teams, and improved delivery consistency.",
    },
  ],
  institutionName: "University of Ghana",
  yearOfCompletion: 2021,
  gradeLevel: "First Class",
  accepted: false,
};

import type { QualificationLevel } from "@prisma/client";

export type MatchType =
  | "EXCELLENT"
  | "GOOD"
  | "AVERAGE"
  | "LOW"
  | "UNDERQUALIFIED";

export interface JobSeekerExperience {
  jobTitle: string;
  companyName: string;
  startDate: Date | string;
  endDate?: Date | string;
  description: string;
}

export interface JobSeekerProfile {
  qualification: QualificationLevel;
  skills: string[];
  experiences: JobSeekerExperience[];
  locationPreference?: string;
}

export interface JobData {
  title: string;
  description: string;
  requiredQualification: QualificationLevel;
  requiredSkills?: string[];
  location?: string;
}

export interface AlgorithmConfig {
  qualificationWeight: number;
  skillsWeight: number;
  experienceWeight: number;
  preferenceWeight: number;
  strictQualification: boolean;
  allowOverqualified: boolean;
  allowUnderqualified: boolean;
  minimumSkillMatchPercent: number;
}

export interface MatchComponents {
  qualification: number;
  skills: number;
  experience: number;
  preference: number;
}

export interface MatchResult {
  score: number;
  matchType: MatchType;
  matchedSkills: string[];
  missingSkills: string[];
  components: MatchComponents;
  disqualified?: boolean;
}

export interface NormalizedTextEntry {
  value: string;
  normalized: string;
}

export const qualificationOrder: QualificationLevel[] = [
  "BECE",
  "WASSCE",
  "DIPLOMA",
  "DEGREE",
  "MASTERS",
  "PHD",
];

export const yearInMilliseconds = 365.25 * 24 * 60 * 60 * 1000;

export function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

export function normalizeText(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

export function getQualificationRank(level: QualificationLevel) {
  return qualificationOrder.indexOf(level);
}

export function compareQualificationLevels(
  left: QualificationLevel,
  right: QualificationLevel,
) {
  return getQualificationRank(left) - getQualificationRank(right);
}

export function normalizeTextEntries(values: string[] | undefined | null) {
  return (values ?? [])
    .map((value) => ({
      value: value.trim(),
      normalized: normalizeText(value),
    }))
    .filter((entry) => entry.value.length > 0);
}

export function yearsBetween(
  startDate: Date | string,
  endDate?: Date | string,
) {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  return Math.max(0, (end.getTime() - start.getTime()) / yearInMilliseconds);
}

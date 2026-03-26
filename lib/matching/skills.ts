import type { AlgorithmConfig, JobData, JobSeekerProfile } from "./utils";
import { clamp, normalizeTextEntries } from "./utils";

export interface SkillsScoreResult {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  matchPercent: number;
}

export function scoreSkills(
  seeker: JobSeekerProfile,
  job: JobData,
  config: AlgorithmConfig,
): SkillsScoreResult {
  const requiredSkills = normalizeTextEntries(job.requiredSkills ?? []);

  if (!requiredSkills.length) {
    return { score: 0, matchedSkills: [], missingSkills: [], matchPercent: 0 };
  }

  const seekerSkillSet = new Set(
    normalizeTextEntries(seeker.skills ?? []).map((entry) => entry.normalized),
  );

  const matchedSkills = requiredSkills
    .filter((skill) => seekerSkillSet.has(skill.normalized))
    .map((skill) => skill.value);

  const missingSkills = requiredSkills
    .filter((skill) => !seekerSkillSet.has(skill.normalized))
    .map((skill) => skill.value);

  const matchPercent = (matchedSkills.length / requiredSkills.length) * 100;
  const minimumSkillMatchPercent = clamp(
    config.minimumSkillMatchPercent,
    0,
    100,
  );

  if (matchPercent < minimumSkillMatchPercent) {
    return { score: 0, matchedSkills, missingSkills, matchPercent };
  }

  return {
    score: (matchPercent / 100) * config.skillsWeight,
    matchedSkills,
    missingSkills,
    matchPercent,
  };
}

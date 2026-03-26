import type { AlgorithmConfig, JobData, JobSeekerProfile } from "./utils";
import { yearsBetween } from "./utils";

export interface ExperienceScoreResult {
  score: number;
  totalYears: number;
  hasRelevantTitle: boolean;
}

export function scoreExperience(
  seeker: JobSeekerProfile,
  job: JobData,
  config: AlgorithmConfig,
): ExperienceScoreResult {
  const totalYears = seeker.experiences.reduce((total, experience) => {
    return total + yearsBetween(experience.startDate, experience.endDate);
  }, 0);

  let score = 0;

  if (totalYears >= 3) {
    score = config.experienceWeight;
  } else {
    score = (totalYears / 3) * config.experienceWeight;
  }

  const hasRelevantTitle = seeker.experiences.some((experience) => {
    const jobTitle = experience.jobTitle.trim().toLowerCase();
    const targetTitle = job.title.trim().toLowerCase();

    return jobTitle.length > 0 && targetTitle.includes(jobTitle);
  });

  if (hasRelevantTitle) {
    score += 5;
  }

  return {
    score: Math.min(score, config.experienceWeight),
    totalYears,
    hasRelevantTitle,
  };
}

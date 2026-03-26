import type { AlgorithmConfig, JobData, JobSeekerProfile } from "./utils";
import { compareQualificationLevels } from "./utils";

export interface QualificationScoreResult {
  score: number;
  disqualified?: boolean;
}

export function scoreQualification(
  seeker: JobSeekerProfile,
  job: JobData,
  config: AlgorithmConfig,
): QualificationScoreResult {
  const comparison = compareQualificationLevels(
    seeker.qualification,
    job.requiredQualification,
  );

  if (comparison < 0) {
    if (config.strictQualification || !config.allowUnderqualified) {
      return { score: 0, disqualified: true };
    }

    return { score: 10 };
  }

  if (comparison === 0) {
    return { score: config.qualificationWeight };
  }

  if (!config.allowOverqualified) {
    return { score: 0 };
  }

  return { score: config.qualificationWeight * 0.8 };
}

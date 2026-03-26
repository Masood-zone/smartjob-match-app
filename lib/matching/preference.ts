import type { AlgorithmConfig, JobData, JobSeekerProfile } from "./utils";
import { normalizeText } from "./utils";

export interface PreferenceScoreResult {
  score: number;
}

export function scorePreference(
  seeker: JobSeekerProfile,
  job: JobData,
  config: AlgorithmConfig,
): PreferenceScoreResult {
  if (!job.location || !seeker.locationPreference) {
    return { score: 0 };
  }

  if (
    normalizeText(job.location) === normalizeText(seeker.locationPreference)
  ) {
    return { score: config.preferenceWeight };
  }

  return { score: 0 };
}

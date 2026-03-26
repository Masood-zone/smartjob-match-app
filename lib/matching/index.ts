export * from "./utils";
export * from "./qualification";
export * from "./skills";
export * from "./experience";
export * from "./preference";

import type {
  AlgorithmConfig,
  JobData,
  JobSeekerProfile,
  MatchResult,
  MatchType,
} from "./utils";
import { scoreQualification } from "./qualification";
import { scoreSkills } from "./skills";
import { scoreExperience } from "./experience";
import { scorePreference } from "./preference";

export function computeMatch(
  seeker: JobSeekerProfile,
  job: JobData,
  config: AlgorithmConfig,
): MatchResult {
  const qualification = scoreQualification(seeker, job, config);
  const skills = scoreSkills(seeker, job, config);

  if (qualification.disqualified) {
    return {
      score: 0,
      matchType: "UNDERQUALIFIED",
      matchedSkills: skills.matchedSkills,
      missingSkills: skills.missingSkills,
      components: {
        qualification: 0,
        skills: 0,
        experience: 0,
        preference: 0,
      },
      disqualified: true,
    };
  }

  const experience = scoreExperience(seeker, job, config);
  const preference = scorePreference(seeker, job, config);

  let score =
    qualification.score + skills.score + experience.score + preference.score;

  if (score > 100) {
    score = 100;
  }

  let matchType: MatchType = "LOW";

  if (score >= 80) {
    matchType = "EXCELLENT";
  } else if (score >= 60) {
    matchType = "GOOD";
  } else if (score >= 40) {
    matchType = "AVERAGE";
  }

  return {
    score,
    matchType,
    matchedSkills: skills.matchedSkills,
    missingSkills: skills.missingSkills,
    components: {
      qualification: qualification.score,
      skills: skills.score,
      experience: experience.score,
      preference: preference.score,
    },
  };
}

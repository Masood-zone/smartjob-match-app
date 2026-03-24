## 🎯 Qualify Smart Job Matching — Matching Algorithm Logic (Updated)

This document defines a **clear, scalable, and implementation-ready guideline** for the job matching engine, aligned with the updated schema and onboarding flow.

---

# 🧠 Core Matching Philosophy

The system prioritizes:

- **Qualification alignment (Primary filter)**
- **Skills relevance (Weighted scoring)**
- **Experience depth (Context scoring)**
- **Preference compatibility (Final refinement)**

---

# ⚙️ Matching Pipeline (Step-by-Step)

## 1. 📥 Data Preparation Layer

Extract structured data from both entities:

### Job Seeker Profile

- `qualification`
- `skills[]`
- `experience[]`
  - jobTitle
  - companyName
  - duration (startDate → endDate)
  - description (keywords extraction)

- `locationPreference`

### Job Data

- `requiredQualification`
- `title`
- `description`

---

## 2. 🚫 Hard Filter (Qualification Gate)

This is the **first elimination stage**.

### Logic:

```ts
if (jobSeeker.qualification < job.requiredQualification) {
  matchType = "UNDERQUALIFIED";
  score = 0;
  return;
}
```

### Outcome:

- Underqualified candidates are either:
  - **Excluded**, OR
  - Stored with low priority (based on system design)

---

## 3. 🧮 Base Qualification Scoring

```ts
if (qualification === requiredQualification) score += 40;
if (qualification > requiredQualification) score += 30;
```

### Match Type:

- Equal → `EXACT`
- Higher → `OVERQUALIFIED`

---

## 4. 🛠 Skills Matching (Weighted — 30%)

### Process:

- Normalize skills (lowercase, trim, deduplicate)
- Extract keywords from job description (NLP optional)

### Logic:

```ts
matchedSkills = intersection(jobSeeker.skills, job.requiredSkills);

skillsScore = (matchedSkills.length / job.requiredSkills.length) * 30;
score += skillsScore;
```

---

## 5. 💼 Experience Scoring (20%)

### Factors:

- Total years of experience
- Relevance of past roles
- Keyword similarity (job title + description)

### Logic:

```ts
experienceYears = calculateYears(jobSeeker.experience);

if (experienceYears >= requiredYears) score += 20;
else score += (experienceYears / requiredYears) * 20;
```

### Bonus:

- Add +5 if **job titles closely match**

---

## 6. 📍 Preference Matching (10%)

### Factors:

- Location preference
- Job type (future: remote, hybrid, onsite)

```ts
if (job.location == jobSeeker.locationPreference) {
  score += 10;
}
```

---

## 7. 🧾 Final Score Normalization

Ensure score is capped:

```ts
if (score > 100) score = 100;
```

---

## 8. 🏷 Match Classification

```ts
if (score >= 80) matchType = "EXCELLENT";
else if (score >= 60) matchType = "GOOD";
else if (score >= 40) matchType = "AVERAGE";
else matchType = "LOW";
```

---

## 9. 💾 Store Match Result

Persist in `Match` model:

```ts
Match {
  jobId
  seekerId
  score
  matchType // EXACT, OVERQUALIFIED, UNDERQUALIFIED
}
```

---

# 🔄 Matching Execution Strategy

## Trigger Points:

- On **job creation**
- On **job seeker onboarding completion**
- On **profile update (skills, experience, qualification)**

---

## Batch Matching (Recommended for Scale)

```ts
for each job in jobs:
  for each seeker in jobSeekers:
    computeMatch(job, seeker)
```

### Optimization:

- Pre-filter seekers by qualification
- Use background jobs (queues)

---

# 🚀 Future Enhancements (Strategic रोडमैप)

### 1. AI/NLP Layer

- Semantic skill matching (e.g., "JS" = "JavaScript")
- Description embedding (vector search)

### 2. Smart Ranking

- Employer preferences weighting
- Historical hiring success feedback loop

### 3. Behavioral Signals

- Applications clicked
- Jobs viewed
- Time spent

### 4. Dynamic Weight Adjustment

- Allow admin to tune:
  - Skills weight
  - Experience weight
  - Qualification strictness

---

# 📊 Scoring Summary

| Component     | Weight  |
| ------------- | ------- |
| Qualification | 40      |
| Skills        | 30      |
| Experience    | 20      |
| Preferences   | 10      |
| **Total**     | **100** |

---

# 🧩 Implementation Notes for Copilot

- Use **modular functions**:
  - `calculateQualificationScore()`
  - `calculateSkillsScore()`
  - `calculateExperienceScore()`
  - `calculatePreferenceScore()`

- Ensure:
  - All scoring functions are **pure**
  - Matching runs **asynchronously (queue/worker)**

- Recommended stack:
  - Queue: **BullMQ / Redis**
  - Search Optimization: **PostgreSQL full-text OR ElasticSearch (future)**

---

# ✅ Final Insight

This system is intentionally:

- **Deterministic (easy to debug)**
- **Extensible (AI-ready)**
- **Efficient (filter-first approach)**

---

The next-level execution:

- Convert this into **actual TypeScript services (NextJS backend)**

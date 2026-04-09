/**
 * Computes a skill match score between a seeker's skills and a job's required skills.
 * @param {string[]} seekerSkills - Array of seeker skill strings
 * @param {string[]} jobSkills - Array of required skill strings for the job
 * @returns {number} Match percentage (0-100)
 */
function matchScore(seekerSkills, jobSkills) {
  if (!jobSkills || jobSkills.length === 0) return 0;
  if (!seekerSkills || seekerSkills.length === 0) return 0;

  const normalizedSeeker = seekerSkills.map((s) => s.toLowerCase().trim());
  const matches = jobSkills.filter((skill) =>
    normalizedSeeker.includes(skill.toLowerCase().trim())
  );

  return Math.round((matches.length / jobSkills.length) * 100);
}

/**
 * Returns jobs recommended for a seeker based on skill overlap.
 * @param {string[]} seekerSkills - Seeker's skills
 * @param {Array} jobs - Array of job documents
 * @param {number} threshold - Minimum match percentage (default 40)
 * @returns {Array} Jobs with matchScore field, sorted descending
 */
function getRecommendedJobs(seekerSkills, jobs, threshold = 40) {
  return jobs
    .map((job) => ({
      ...job.toObject ? job.toObject() : job,
      matchScore: matchScore(seekerSkills, job.requiredSkills)
    }))
    .filter((job) => job.matchScore >= threshold)
    .sort((a, b) => b.matchScore - a.matchScore);
}

module.exports = { matchScore, getRecommendedJobs };

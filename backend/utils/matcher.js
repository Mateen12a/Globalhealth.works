// utils/matcher.js
function calculateMatchScore(sp, task) {
  let score = 0;

  // Skills overlap
  const skillMatches = task.requiredSkills.filter(skill =>
    sp.expertise.includes(skill)
  );
  score += skillMatches.length * 5; // each skill = 5 points

  // Focus areas
  const focusMatches = task.focusAreas.filter(area =>
    sp.focusAreas.includes(area)
  );
  score += focusMatches.length * 3; // each focus area = 3 points

  // Languages
  const langMatches = task.languages.filter(lang =>
    sp.languages?.includes(lang)
  );
  score += langMatches.length * 2;

  // Location (optional boost)
  if (sp.country && task.location && sp.country === task.location) {
    score += 2;
  }

  return score;
}

module.exports = { calculateMatchScore };

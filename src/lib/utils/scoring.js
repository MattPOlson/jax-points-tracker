// Pure competition scoring / ranking logic (#80).
//
// Extracted from the judging-dashboard and the two results pages, which each
// carried their own copy of the point table and compilation logic. Keeping it
// here — free of Svelte/Supabase — makes the riskiest math unit-testable and
// single-sourced.

// Point system: 1st = 3pts, 2nd = 2pts, 3rd = 1pt, everything else 0.
export const POINTS_BY_RANK = { 1: 3, 2: 2, 3: 1 };

/**
 * Points awarded for a single judge's rank of an entry.
 * @param {number} rankPosition
 * @returns {number}
 */
export function getPointsForRanking(rankPosition) {
  return POINTS_BY_RANK[rankPosition] ?? 0;
}

/**
 * A ranking group's category ids, whether stored as a jsonb array or a JSON
 * string. Returns null when it can't be parsed.
 */
export function parseCategoryIds(group) {
  if (!group) return null;
  try {
    return Array.isArray(group.bjcp_category_ids)
      ? group.bjcp_category_ids
      : JSON.parse(group.bjcp_category_ids);
  } catch {
    return null;
  }
}

/**
 * The id of the custom ranking group that contains a category, or null when the
 * category isn't part of any group (i.e. it ranks on its own).
 */
export function findRankingGroupIdForCategory(categoryId, rankingGroups = []) {
  for (const group of rankingGroups) {
    const categoryIds = parseCategoryIds(group);
    if (categoryIds && categoryIds.includes(categoryId)) return group.id;
  }
  return null;
}

/**
 * Sum an entry's points across every judge. When a groupId is given the entry
 * is ranked within that custom group; otherwise within its own category.
 * @returns {{ totalPoints: number, judgeCount: number, rankings: object[] }}
 */
export function compileEntryPoints(rankings = [], entryId, { categoryId = null, groupId = null } = {}) {
  const entryRankings = rankings.filter((r) =>
    r.entry_id === entryId &&
    (groupId ? r.ranking_group_id === groupId : r.bjcp_category_id === categoryId)
  );
  const totalPoints = entryRankings.reduce((sum, r) => sum + getPointsForRanking(r.rank_position), 0);
  return { totalPoints, judgeCount: entryRankings.length, rankings: entryRankings };
}

/**
 * Results-page convenience: resolve the entry's ranking group from its category,
 * then compile its points. Mirrors the signature the results pages already used.
 */
export function calculateEntryPoints(entryId, categoryId, rankings = [], rankingGroups = []) {
  const groupId = findRankingGroupIdForCategory(categoryId, rankingGroups);
  return compileEntryPoints(rankings, entryId, { categoryId, groupId });
}

/** True when more than one distinct judge appears in the rankings. */
export function hasMultipleJudges(rankings = []) {
  return new Set(rankings.map((r) => r.judge_id)).size > 1;
}

/** De-duplicated entry objects pulled from a list of rankings, order preserved. */
export function getUniqueEntriesFromRankings(rankings = []) {
  const entryMap = new Map();
  for (const ranking of rankings) {
    if (ranking.entry_id && !entryMap.has(ranking.entry_id)) {
      entryMap.set(ranking.entry_id, ranking.entry);
    }
  }
  return Array.from(entryMap.values());
}

/**
 * Average judging score for an entry across its completed sessions (those with
 * total_score > 0), rounded to one decimal. Returns zeros when none completed.
 */
export function computeEntryScoreStats(sessions = [], entryId) {
  const entryScores = sessions.filter((s) => s.entry_id === entryId && s.total_score > 0);
  if (entryScores.length === 0) return { count: 0, average: 0, scores: [] };
  const scores = entryScores.map((s) => s.total_score);
  const average = Math.round((scores.reduce((sum, v) => sum + v, 0) / scores.length) * 10) / 10;
  return { count: entryScores.length, average, scores, sessions: entryScores };
}

/** Placement label for a final rank position: 1/2/3, HM for 4th–5th, else null. */
export function placementForRank(rankPosition) {
  if (rankPosition === 1) return '1';
  if (rankPosition === 2) return '2';
  if (rankPosition === 3) return '3';
  if (rankPosition <= 5) return 'HM';
  return null;
}

/**
 * Order entries by compiled points (desc), breaking ties by average score
 * (desc), and assign each a 1-based rankPosition and placement. Only entries
 * that actually earned points receive a placement. Input is not mutated.
 *
 * @param {{ totalPoints: number, averageScore: number }[]} entries
 */
export function rankEntries(entries = []) {
  const sorted = [...entries].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    return b.averageScore - a.averageScore;
  });
  return sorted.map((entry, index) => {
    const rankPosition = index + 1;
    return {
      ...entry,
      rankPosition,
      placement: entry.totalPoints > 0 ? placementForRank(rankPosition) : null
    };
  });
}

import { describe, it, expect } from 'vitest';
import {
  getPointsForRanking,
  parseCategoryIds,
  findRankingGroupIdForCategory,
  compileEntryPoints,
  calculateEntryPoints,
  hasMultipleJudges,
  getUniqueEntriesFromRankings,
  computeEntryScoreStats,
  placementForRank,
  rankEntries
} from './scoring.js';

describe('getPointsForRanking', () => {
  it.each([
    [1, 3],
    [2, 2],
    [3, 1],
    [4, 0],
    [10, 0],
    [0, 0],
    [undefined, 0]
  ])('rank %s → %s pts', (rank, pts) => {
    expect(getPointsForRanking(rank)).toBe(pts);
  });
});

describe('parseCategoryIds', () => {
  it('returns an array as-is', () => {
    expect(parseCategoryIds({ bjcp_category_ids: ['a', 'b'] })).toEqual(['a', 'b']);
  });

  it('parses a JSON string', () => {
    expect(parseCategoryIds({ bjcp_category_ids: '["a","b"]' })).toEqual(['a', 'b']);
  });

  it('returns null for malformed JSON', () => {
    expect(parseCategoryIds({ bjcp_category_ids: '{not json' })).toBeNull();
  });

  it('returns null for a missing group', () => {
    expect(parseCategoryIds(null)).toBeNull();
  });
});

describe('findRankingGroupIdForCategory', () => {
  const groups = [
    { id: 'g1', bjcp_category_ids: ['cat-a', 'cat-b'] },
    { id: 'g2', bjcp_category_ids: '["cat-c"]' }
  ];

  it('finds the group holding the category (array form)', () => {
    expect(findRankingGroupIdForCategory('cat-b', groups)).toBe('g1');
  });

  it('finds the group holding the category (JSON-string form)', () => {
    expect(findRankingGroupIdForCategory('cat-c', groups)).toBe('g2');
  });

  it('returns null when no group contains the category', () => {
    expect(findRankingGroupIdForCategory('cat-z', groups)).toBeNull();
  });

  it('skips groups whose ids fail to parse', () => {
    expect(findRankingGroupIdForCategory('cat-a', [{ id: 'bad', bjcp_category_ids: '{' }])).toBeNull();
  });
});

describe('compileEntryPoints', () => {
  const rankings = [
    { entry_id: 'e1', bjcp_category_id: 'cat-a', judge_id: 'j1', rank_position: 1 }, // 3
    { entry_id: 'e1', bjcp_category_id: 'cat-a', judge_id: 'j2', rank_position: 2 }, // 2
    { entry_id: 'e1', ranking_group_id: 'grp', judge_id: 'j3', rank_position: 1 }, // group, 3
    { entry_id: 'e2', bjcp_category_id: 'cat-a', judge_id: 'j1', rank_position: 1 }
  ];

  it('sums points across judges within a category', () => {
    const result = compileEntryPoints(rankings, 'e1', { categoryId: 'cat-a' });
    expect(result).toEqual({
      totalPoints: 5,
      judgeCount: 2,
      rankings: [rankings[0], rankings[1]]
    });
  });

  it('compiles within a custom group when groupId is given', () => {
    const result = compileEntryPoints(rankings, 'e1', { groupId: 'grp' });
    expect(result.totalPoints).toBe(3);
    expect(result.judgeCount).toBe(1);
  });

  it('returns zeros for an entry with no rankings', () => {
    expect(compileEntryPoints(rankings, 'nobody', { categoryId: 'cat-a' })).toEqual({
      totalPoints: 0,
      judgeCount: 0,
      rankings: []
    });
  });

  it('defaults to an empty ranking list', () => {
    expect(compileEntryPoints(undefined, 'e1', { categoryId: 'cat-a' }).totalPoints).toBe(0);
  });
});

describe('calculateEntryPoints', () => {
  const rankingGroups = [{ id: 'grp', bjcp_category_ids: ['cat-a'] }];
  const rankings = [
    { entry_id: 'e1', ranking_group_id: 'grp', judge_id: 'j1', rank_position: 1 }, // 3 (group)
    { entry_id: 'e1', bjcp_category_id: 'cat-a', judge_id: 'j2', rank_position: 1 } // ignored: category is grouped
  ];

  it('resolves the group from the category, then compiles within the group', () => {
    const result = calculateEntryPoints('e1', 'cat-a', rankings, rankingGroups);
    expect(result.totalPoints).toBe(3);
    expect(result.judgeCount).toBe(1);
  });

  it('compiles by category when the category is in no group', () => {
    const soloRankings = [
      { entry_id: 'e1', bjcp_category_id: 'cat-solo', judge_id: 'j1', rank_position: 2 }
    ];
    expect(calculateEntryPoints('e1', 'cat-solo', soloRankings, rankingGroups).totalPoints).toBe(2);
  });
});

describe('hasMultipleJudges', () => {
  it('is true for two or more distinct judges', () => {
    expect(hasMultipleJudges([{ judge_id: 'j1' }, { judge_id: 'j2' }])).toBe(true);
  });

  it('is false for a single judge (even across multiple rows)', () => {
    expect(hasMultipleJudges([{ judge_id: 'j1' }, { judge_id: 'j1' }])).toBe(false);
  });

  it('is false for no rankings', () => {
    expect(hasMultipleJudges([])).toBe(false);
  });
});

describe('getUniqueEntriesFromRankings', () => {
  it('dedupes by entry_id, preserving first occurrence and order', () => {
    const rankings = [
      { entry_id: 'e1', entry: { id: 'e1', name: 'A' } },
      { entry_id: 'e2', entry: { id: 'e2', name: 'B' } },
      { entry_id: 'e1', entry: { id: 'e1', name: 'A-dup' } }
    ];
    expect(getUniqueEntriesFromRankings(rankings)).toEqual([
      { id: 'e1', name: 'A' },
      { id: 'e2', name: 'B' }
    ]);
  });

  it('ignores rankings without an entry_id', () => {
    expect(getUniqueEntriesFromRankings([{ entry: { id: 'x' } }])).toEqual([]);
  });
});

describe('computeEntryScoreStats', () => {
  const sessions = [
    { entry_id: 'e1', total_score: 40 },
    { entry_id: 'e1', total_score: 35 },
    { entry_id: 'e1', total_score: 0 }, // incomplete, excluded
    { entry_id: 'e2', total_score: 30 }
  ];

  it('averages completed sessions for the entry, rounded to one decimal', () => {
    const stats = computeEntryScoreStats(sessions, 'e1');
    expect(stats.count).toBe(2);
    expect(stats.average).toBe(37.5);
    expect(stats.scores).toEqual([40, 35]);
    expect(stats.sessions).toHaveLength(2);
  });

  it('rounds to a single decimal place', () => {
    const s = [
      { entry_id: 'e', total_score: 40 },
      { entry_id: 'e', total_score: 41 },
      { entry_id: 'e', total_score: 41 }
    ];
    // (40+41+41)/3 = 40.666… → 40.7
    expect(computeEntryScoreStats(s, 'e').average).toBe(40.7);
  });

  it('returns zeros (and no sessions key) when nothing is completed', () => {
    expect(computeEntryScoreStats(sessions, 'nobody')).toEqual({ count: 0, average: 0, scores: [] });
  });
});

describe('placementForRank', () => {
  it.each([
    [1, '1'],
    [2, '2'],
    [3, '3'],
    [4, 'HM'],
    [5, 'HM'],
    [6, null],
    [99, null]
  ])('rank %s → %s', (rank, placement) => {
    expect(placementForRank(rank)).toBe(placement);
  });
});

describe('rankEntries', () => {
  it('orders by points desc, then average score, and assigns placements', () => {
    const ranked = rankEntries([
      { id: 'a', totalPoints: 3, averageScore: 38 },
      { id: 'b', totalPoints: 6, averageScore: 40 },
      { id: 'c', totalPoints: 3, averageScore: 42 }
    ]);
    expect(ranked.map((e) => e.id)).toEqual(['b', 'c', 'a']); // c beats a on tiebreak
    expect(ranked.map((e) => e.rankPosition)).toEqual([1, 2, 3]);
    expect(ranked.map((e) => e.placement)).toEqual(['1', '2', '3']);
  });

  it('awards HM to 4th and 5th, nothing past 5th', () => {
    const entries = Array.from({ length: 6 }, (_, i) => ({
      id: `e${i}`,
      totalPoints: 6 - i, // strictly descending so order is stable
      averageScore: 0
    }));
    const ranked = rankEntries(entries);
    expect(ranked.map((e) => e.placement)).toEqual(['1', '2', '3', 'HM', 'HM', null]);
  });

  it('never places an entry that earned zero points', () => {
    const ranked = rankEntries([
      { id: 'a', totalPoints: 0, averageScore: 45 },
      { id: 'b', totalPoints: 0, averageScore: 30 }
    ]);
    expect(ranked.every((e) => e.placement === null)).toBe(true);
    // rank positions are still assigned by the sort
    expect(ranked.map((e) => e.id)).toEqual(['a', 'b']);
  });

  it('does not mutate the input array', () => {
    const input = [
      { id: 'a', totalPoints: 1, averageScore: 1 },
      { id: 'b', totalPoints: 2, averageScore: 1 }
    ];
    const snapshot = JSON.parse(JSON.stringify(input));
    rankEntries(input);
    expect(input).toEqual(snapshot);
  });
});

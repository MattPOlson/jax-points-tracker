# Multi-Judge Ranking Compilation

## Current Issue

The JAX Beer Points Tracker system currently allows multiple judges to submit independent rankings for the same category or custom ranking group. However, there's no automatic compilation/consolidation of these rankings into a final result.

## Problem Description

When multiple judges rank the same category:
- Each judge can submit their own 1st, 2nd, 3rd place rankings
- The dashboard shows all rankings from all judges
- There's no clear indication of which ranking is "final" for the competition
- Competition directors cannot easily determine award winners

## Industry Standard Approaches

### 1. Head Judge System
- One judge is designated as the "head judge" for each category
- Head judge's rankings are considered final
- Other judges' rankings are advisory

### 2. Consensus Ranking
- Judges discuss rankings in person
- Reach consensus on final rankings
- System stores only the final agreed-upon ranking

### 3. Score-Based Automatic Ranking
- System uses judges' individual scores to determine final rankings
- Entries ranked by average or total score across all judges
- No manual ranking required

### 4. Weighted Ranking Compilation
- System combines multiple judges' rankings using algorithms
- Common methods: Borda count, average ranking position, etc.

## Recommended Implementation

For the JAX Beer Points Tracker, we recommend implementing multiple approaches:

### Phase 1: Detection and Warning (✅ Implemented)
- Detect when multiple judges have submitted rankings
- Display warning to competition directors
- Show all rankings clearly labeled by judge

### Phase 2: Head Judge System
- Add "head_judge" field to competition_judges table
- Allow competition directors to designate head judges
- System prioritizes head judge rankings in final results

### Phase 3: Score-Based Ranking
- Add option to use judges' scores instead of manual rankings
- Calculate final rankings based on score averages
- Provide both score-based and manual ranking options

### Phase 4: Consensus Mode
- Add "consensus" mode for categories
- Allow judges to collaborate on shared rankings
- Lock rankings once consensus is reached

## Database Schema Changes Needed

```sql
-- Add head judge designation
ALTER TABLE competition_judges 
ADD COLUMN is_head_judge BOOLEAN DEFAULT false;

-- Add ranking compilation method
ALTER TABLE competitions 
ADD COLUMN ranking_method TEXT DEFAULT 'manual' 
CHECK (ranking_method IN ('manual', 'score_based', 'consensus', 'head_judge'));

-- Add ranking status
ALTER TABLE competition_rankings 
ADD COLUMN status TEXT DEFAULT 'draft' 
CHECK (status IN ('draft', 'final', 'consensus'));
```

## Current Workaround

Until automatic compilation is implemented:
1. Competition directors should designate one judge per category as the "official" judge
2. Use the dashboard warning to identify categories with multiple rankings
3. Manually resolve conflicts by selecting the preferred ranking
4. Consider using score-based results as a tie-breaker

## Impact on Competition Flow

- **Low Impact**: Categories with single judge continue to work normally
- **Medium Impact**: Categories with multiple judges show warning but remain functional
- **High Value**: Competition directors gain visibility into ranking conflicts

## Next Steps

1. ✅ Implement detection and warning system
2. ⏳ Add head judge designation feature
3. ⏳ Implement score-based ranking option
4. ⏳ Add consensus mode for collaborative ranking
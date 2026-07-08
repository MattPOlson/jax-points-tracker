-- #107: index the hot paths on point_submissions, cover two unindexed FKs,
-- and drop the advisor-flagged duplicate indexes. Tables are small, so
-- plain CREATE INDEX (not CONCURRENTLY, which can't run in a migration
-- transaction) is fine.

-- point_submissions: FK member_id was unindexed -- every my-submissions
-- query and RLS member_id = auth.uid() check seq-scanned.
create index if not exists idx_point_submissions_member
  on public.point_submissions (member_id);

-- Composite for the leaderboard/approvals filters (approved + event_date
-- range). Makes the old single-column approved index redundant.
create index if not exists idx_point_submissions_approved_date
  on public.point_submissions (approved, event_date);
drop index if exists public.idx_point_submissions_approved;

-- Unindexed FKs that are filtered/joined in practice:
-- competition_results.entry_id (competition_id is already covered by the
-- unique (competition_id, entry_id) index).
create index if not exists idx_competition_results_entry
  on public.competition_results (entry_id);
-- push_subscriptions.member_id (RLS owner check + per-member lookups).
create index if not exists idx_push_subscriptions_member
  on public.push_subscriptions (member_id);

-- Duplicate indexes (advisor duplicate_index, verified identical defs):
drop index if exists public.idx_competition_entries_competition_id; -- keep idx_competition_entries_competition
drop index if exists public.idx_competitions_is_active;             -- keep idx_competitions_active (both on active)
drop index if exists public.idx_competitions_deadline;              -- keep idx_competitions_entry_deadline (both on entry_deadline)

-- Stats had never been collected (n_live_tup reported 0 everywhere);
-- give the planner real numbers so it can actually use these indexes.
analyze;

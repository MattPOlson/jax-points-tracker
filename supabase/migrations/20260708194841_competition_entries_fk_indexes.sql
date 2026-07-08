-- #107 follow-up: two more unindexed FKs that ARE filtered in practice
-- (verified against app queries):
-- - competition_entries.bjcp_category_id: rankings page filters .eq/.in on
--   it, results page orders by it
-- - competition_entries.table_id: judging store loads entries per assigned
--   table
create index if not exists idx_competition_entries_bjcp_category
  on public.competition_entries (bjcp_category_id);
create index if not exists idx_competition_entries_table
  on public.competition_entries (table_id);

analyze public.competition_entries;

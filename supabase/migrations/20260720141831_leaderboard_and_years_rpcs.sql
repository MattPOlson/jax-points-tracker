-- Move leaderboard aggregation into the database (#108).
--
-- The leaderboard and the year picker previously shipped every approved
-- point_submissions row to the browser — one RLS check paid per row — and
-- summed / de-duplicated in JS. These RPCs return one row per member / one
-- row per year instead, and lean on idx_point_submissions_approved_date
-- (approved, event_date) from #107.
--
-- SECURITY INVOKER (the default) so RLS still applies as the calling user,
-- matching get_members_with_points. Approved rows are readable by every
-- authenticated member per the point_submissions SELECT policy, so the
-- aggregate is correct without elevating privileges.

create or replace function public.get_leaderboard(p_year int)
returns table (member_id uuid, name text, total_points bigint)
language sql
stable
as $fn$
  select ps.member_id, m.name, sum(ps.points)::bigint
  from public.point_submissions ps
  join public.members m on m.id = ps.member_id
  where ps.approved = true
    and ps.event_date >= make_date(p_year, 1, 1)
    and ps.event_date < make_date(p_year + 1, 1, 1)
  group by ps.member_id, m.name
  order by 3 desc;
$fn$;

create or replace function public.get_submission_years()
returns setof int
language sql
stable
as $fn$
  select distinct extract(year from event_date)::int
  from public.point_submissions
  where approved = true and event_date is not null
  order by 1 desc;
$fn$;

-- EXECUTE is granted to PUBLIC by default; signed-in members only
-- (mirrors 20260707201355_tighten_function_execute_grants.sql).
revoke execute on function public.get_leaderboard(int) from public, anon;
revoke execute on function public.get_submission_years() from public, anon;
grant execute on function public.get_leaderboard(int) to authenticated;
grant execute on function public.get_submission_years() to authenticated;

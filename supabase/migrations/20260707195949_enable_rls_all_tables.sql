-- =============================================================
-- Enable Row Level Security on all public tables (#55)
--
-- Model:
--   * anon (logged out)      -> no access to anything
--   * authenticated member   -> read club data; write own rows
--   * officer (is_officer)   -> manage; synced from role by trigger
--   * assigned judge         -> write scoresheets/rankings for
--                               competitions they are assigned to
--   * service role (API)     -> bypasses RLS (push endpoints)
--
-- Also enforces #18 at the DB: officers cannot approve their own
-- point submissions.
-- =============================================================

-- -------------------------------------------------------------
-- Helper functions (SECURITY DEFINER so policies on `members`
-- itself don't recurse, and with a pinned search_path)
-- -------------------------------------------------------------
create or replace function public.is_officer()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select coalesce(
    (select m.is_officer from public.members m where m.id = auth.uid()),
    false
  );
$$;

create or replace function public.is_competition_judge(p_competition_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.competition_judges cj
    where cj.judge_id = auth.uid()
      and cj.competition_id = p_competition_id
      and cj.active = true
  );
$$;

revoke execute on function public.is_officer() from public, anon;
revoke execute on function public.is_competition_judge(uuid) from public, anon;
grant execute on function public.is_officer() to authenticated;
grant execute on function public.is_competition_judge(uuid) to authenticated;

-- -------------------------------------------------------------
-- members: privileged-column guard.
-- RLS is row-level only; without this a member could UPDATE their
-- own row and set role/is_officer/active.
-- -------------------------------------------------------------
create or replace function public.members_restrict_privileged_updates()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  -- No JWT (service role, dashboard, migrations): unrestricted.
  if auth.uid() is null then
    return new;
  end if;

  if public.is_officer() then
    if new.role = 'president' and old.role is distinct from 'president'
       and (select m.role from public.members m where m.id = auth.uid()) <> 'president' then
      raise exception 'Only the president can promote a member to president';
    end if;
    return new;
  end if;

  if new.role is distinct from old.role
     or new.is_officer is distinct from old.is_officer
     or new.active is distinct from old.active then
    raise exception 'Only officers can change member roles or status';
  end if;

  return new;
end;
$$;

drop trigger if exists members_restrict_privileged_updates on public.members;
create trigger members_restrict_privileged_updates
  before update on public.members
  for each row execute function public.members_restrict_privileged_updates();

-- -------------------------------------------------------------
-- competition_entries: payment/assignment column guard.
-- Members may create and edit their own entries, but must not be
-- able to mark them paid or move them between judging tables.
-- -------------------------------------------------------------
create or replace function public.competition_entries_restrict_member_writes()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.is_officer() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if coalesce(new.is_paid, false)
       or coalesce(new.entry_fee_paid, false)
       or new.payment_date is not null
       or new.payment_method is not null
       or new.table_id is not null then
      raise exception 'Only officers can set payment or table assignment fields';
    end if;
    return new;
  end if;

  if new.is_paid is distinct from old.is_paid
     or new.entry_fee_paid is distinct from old.entry_fee_paid
     or new.payment_date is distinct from old.payment_date
     or new.payment_method is distinct from old.payment_method
     or new.entry_number is distinct from old.entry_number
     or new.table_id is distinct from old.table_id then
    raise exception 'Only officers can change payment or table assignment fields';
  end if;

  return new;
end;
$$;

drop trigger if exists competition_entries_restrict_member_writes on public.competition_entries;
create trigger competition_entries_restrict_member_writes
  before insert or update on public.competition_entries
  for each row execute function public.competition_entries_restrict_member_writes();

-- -------------------------------------------------------------
-- members
-- -------------------------------------------------------------
alter table public.members enable row level security;

create policy "Members can view the club roster"
  on public.members for select to authenticated
  using (true);

create policy "Members can update own profile"
  on public.members for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Officers can update members"
  on public.members for update to authenticated
  using (public.is_officer())
  with check (public.is_officer());

-- No INSERT/DELETE policies: rows are created by the auth trigger
-- (SECURITY DEFINER) and never deleted from the client.

-- -------------------------------------------------------------
-- point_submissions  (#18 enforced here)
-- -------------------------------------------------------------
alter table public.point_submissions enable row level security;

create policy "Members see approved, own, or all if officer"
  on public.point_submissions for select to authenticated
  using (approved = true or member_id = auth.uid() or public.is_officer());

create policy "Members can submit own unapproved points"
  on public.point_submissions for insert to authenticated
  with check (member_id = auth.uid() and approved is not true);

create policy "Officers can review others' submissions"
  on public.point_submissions for update to authenticated
  using (public.is_officer() and member_id <> auth.uid())
  with check (public.is_officer() and member_id <> auth.uid());

-- -------------------------------------------------------------
-- Reference tables: readable by any signed-in member, no client
-- writes (managed via service role / SQL scripts).
-- -------------------------------------------------------------
alter table public.point_categories enable row level security;
create policy "Members can read point categories"
  on public.point_categories for select to authenticated using (true);

alter table public.categories enable row level security;
create policy "Members can read categories"
  on public.categories for select to authenticated using (true);

alter table public.monthly_challenge enable row level security;
create policy "Members can read monthly challenges"
  on public.monthly_challenge for select to authenticated using (true);

alter table public.florida_circuit_events enable row level security;
create policy "Members can read circuit events"
  on public.florida_circuit_events for select to authenticated using (true);

alter table public.club_events_types enable row level security;
create policy "Members can read club event types"
  on public.club_events_types for select to authenticated using (true);

alter table public.bjcp_categories enable row level security;
create policy "Members can read BJCP categories"
  on public.bjcp_categories for select to authenticated using (true);

-- -------------------------------------------------------------
-- competitions
-- -------------------------------------------------------------
alter table public.competitions enable row level security;

create policy "Members can view competitions"
  on public.competitions for select to authenticated
  using (true);

create policy "Officers can create competitions"
  on public.competitions for insert to authenticated
  with check (public.is_officer());

create policy "Officers can update competitions"
  on public.competitions for update to authenticated
  using (public.is_officer())
  with check (public.is_officer());

create policy "Officers can delete competitions"
  on public.competitions for delete to authenticated
  using (public.is_officer());

-- -------------------------------------------------------------
-- competition_entries
-- -------------------------------------------------------------
alter table public.competition_entries enable row level security;

create policy "Members can view competition entries"
  on public.competition_entries for select to authenticated
  using (true);

create policy "Members can submit own entries"
  on public.competition_entries for insert to authenticated
  with check (member_id = auth.uid() or public.is_officer());

create policy "Members can edit own entries, officers any"
  on public.competition_entries for update to authenticated
  using (member_id = auth.uid() or public.is_officer())
  with check (member_id = auth.uid() or public.is_officer());

create policy "Members can delete own entries, officers any"
  on public.competition_entries for delete to authenticated
  using (member_id = auth.uid() or public.is_officer());

-- -------------------------------------------------------------
-- competition_results: hidden until published (officers always)
-- -------------------------------------------------------------
alter table public.competition_results enable row level security;

create policy "Members see published results, officers all"
  on public.competition_results for select to authenticated
  using (
    public.is_officer()
    or exists (
      select 1 from public.competitions c
      where c.id = competition_id and c.results_published = true
    )
  );

create policy "Officers can record results"
  on public.competition_results for insert to authenticated
  with check (public.is_officer());

create policy "Officers can update results"
  on public.competition_results for update to authenticated
  using (public.is_officer())
  with check (public.is_officer());

-- -------------------------------------------------------------
-- competition_judges: assignments managed by officers
-- -------------------------------------------------------------
alter table public.competition_judges enable row level security;

create policy "Members can view judge assignments"
  on public.competition_judges for select to authenticated
  using (true);

create policy "Officers can assign judges"
  on public.competition_judges for insert to authenticated
  with check (public.is_officer());

create policy "Officers can update judge assignments"
  on public.competition_judges for update to authenticated
  using (public.is_officer())
  with check (public.is_officer());

create policy "Officers can delete judge assignments"
  on public.competition_judges for delete to authenticated
  using (public.is_officer());

-- -------------------------------------------------------------
-- competition_judging_sessions (scoresheets)
-- -------------------------------------------------------------
alter table public.competition_judging_sessions enable row level security;

create policy "Judges, officers, and entry owners can view scoresheets"
  on public.competition_judging_sessions for select to authenticated
  using (
    judge_id = auth.uid()
    or public.is_officer()
    or public.is_competition_judge(competition_id)
    or exists (
      select 1 from public.competition_entries e
      where e.id = entry_id and e.member_id = auth.uid()
    )
  );

create policy "Assigned judges can create own scoresheets"
  on public.competition_judging_sessions for insert to authenticated
  with check (
    (judge_id = auth.uid() and public.is_competition_judge(competition_id))
    or public.is_officer()
  );

create policy "Assigned judges can update own scoresheets"
  on public.competition_judging_sessions for update to authenticated
  using (
    (judge_id = auth.uid() and public.is_competition_judge(competition_id))
    or public.is_officer()
  )
  with check (
    (judge_id = auth.uid() and public.is_competition_judge(competition_id))
    or public.is_officer()
  );

-- -------------------------------------------------------------
-- competition_rankings
-- -------------------------------------------------------------
alter table public.competition_rankings enable row level security;

create policy "Rankings visible to judges, officers, or once published"
  on public.competition_rankings for select to authenticated
  using (
    judge_id = auth.uid()
    or public.is_officer()
    or public.is_competition_judge(competition_id)
    or exists (
      select 1 from public.competitions c
      where c.id = competition_id and c.results_published = true
    )
  );

create policy "Assigned judges can create own rankings"
  on public.competition_rankings for insert to authenticated
  with check (
    (judge_id = auth.uid() and public.is_competition_judge(competition_id))
    or public.is_officer()
  );

create policy "Assigned judges can update own rankings"
  on public.competition_rankings for update to authenticated
  using (judge_id = auth.uid() or public.is_officer())
  with check (
    (judge_id = auth.uid() and public.is_competition_judge(competition_id))
    or public.is_officer()
  );

create policy "Assigned judges can delete own rankings"
  on public.competition_rankings for delete to authenticated
  using (judge_id = auth.uid() or public.is_officer());

-- -------------------------------------------------------------
-- competition_ranking_groups / judging_tables: officer-managed
-- -------------------------------------------------------------
alter table public.competition_ranking_groups enable row level security;

create policy "Members can view ranking groups"
  on public.competition_ranking_groups for select to authenticated
  using (true);

create policy "Officers can manage ranking groups"
  on public.competition_ranking_groups for all to authenticated
  using (public.is_officer())
  with check (public.is_officer());

alter table public.judging_tables enable row level security;

create policy "Members can view judging tables"
  on public.judging_tables for select to authenticated
  using (true);

create policy "Officers can manage judging tables"
  on public.judging_tables for all to authenticated
  using (public.is_officer())
  with check (public.is_officer());

-- -------------------------------------------------------------
-- push_subscriptions: written only via service-role API routes;
-- officers read counts in the notifications page.
-- -------------------------------------------------------------
alter table public.push_subscriptions enable row level security;

create policy "Officers and owners can view push subscriptions"
  on public.push_subscriptions for select to authenticated
  using (member_id = auth.uid() or public.is_officer());

-- -------------------------------------------------------------
-- events / event_signups
-- event_signups already had member policies written but RLS was
-- never enabled; add read + officer management.
-- -------------------------------------------------------------
alter table public.events enable row level security;

create policy "Members can view events"
  on public.events for select to authenticated
  using (true);

create policy "Officers can manage events"
  on public.events for all to authenticated
  using (public.is_officer())
  with check (public.is_officer());

alter table public.event_signups enable row level security;

create policy "Members can view signups"
  on public.event_signups for select to authenticated
  using (true);

create policy "Officers can manage signups"
  on public.event_signups for all to authenticated
  using (public.is_officer())
  with check (public.is_officer());

-- -------------------------------------------------------------
-- SECURITY DEFINER views bypass RLS; the app doesn't use them,
-- so make them honor the querying user's permissions.
-- -------------------------------------------------------------
alter view public.member_hierarchy set (security_invoker = true);
alter view public.judge_assignment_summary set (security_invoker = true);
alter view public.entry_judging_summary set (security_invoker = true);

-- -------------------------------------------------------------
-- Anon-callable SECURITY DEFINER RPCs flagged by the advisor.
-- handle_new_user is a trigger function and should never be
-- client-callable at all.
-- -------------------------------------------------------------
revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.get_active_competitions() from anon;
revoke execute on function public.get_bjcp_categories() from anon;
revoke execute on function public.get_competitions_with_stats() from anon;

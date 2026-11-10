-- Member contact privacy, step 2 of 2 (#153).
--
-- >>> NOT YET APPLIED. Apply only after the app code from this PR is live in
-- >>> production: the previous build reads and writes members.email / phone
-- >>> and breaks once the columns are gone. After applying, rename this file
-- >>> to the version stamp Supabase assigns.
--
-- Step 1 (20261110191637_member_contacts_table.sql) copied email/phone into
-- member_contacts and kept them in sync. This step removes the copies on
-- `members`, which is what actually stops other signed-in accounts from
-- reading them.

-- Transitional sync is no longer needed.
drop trigger if exists members_sync_contacts on public.members;
drop function if exists public.members_sync_contacts();

-- Signup: write the contact row directly. The display-name fallback no
-- longer uses the full email address (names are visible to every member);
-- it uses the part before the @ instead.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
begin
  insert into public.members (id, name)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'full_name', ''),
      nullif(new.raw_user_meta_data->>'name', ''),
      nullif(new.raw_user_meta_data->>'preferred_username', ''),
      split_part(new.email, '@', 1)
    )
  );

  insert into public.member_contacts (member_id, email)
  values (new.id, new.email);

  return new;
end;
$function$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Officer roster RPC: same signature, email now comes from member_contacts.
-- SECURITY INVOKER, so RLS on member_contacts applies: officers get every
-- email, anyone else gets null for rows that are not their own.
create or replace function public.get_members_with_points()
returns table (
  id uuid,
  name text,
  email text,
  role character varying,
  role_display text,
  role_priority integer,
  can_manage_officers boolean,
  is_officer boolean,
  join_date date,
  total_points integer,
  total_approved_submissions integer,
  last_submission_date timestamp with time zone,
  monthly_points integer
)
language plpgsql
set search_path = public
as $function$
begin
  return query
  select
    m.id,
    m.name,
    mc.email,
    m.role,
    case m.role
      when 'president' then 'President'
      when 'vice_president' then 'Vice President'
      when 'officer' then 'Officer'
      when 'member' then 'Member'
      else 'Unknown'
    end as role_display,
    case m.role
      when 'president' then 1
      when 'vice_president' then 2
      when 'officer' then 3
      when 'member' then 4
      else 5
    end as role_priority,
    case m.role
      when 'president' then true
      when 'vice_president' then true
      else false
    end as can_manage_officers,
    m.is_officer,
    m.join_date,
    coalesce(sum(case when ps.approved = true then ps.points else 0 end), 0)::integer as total_points,
    count(case when ps.approved = true then 1 end)::integer as total_approved_submissions,
    max(ps.submitted_at) as last_submission_date,
    coalesce(sum(case
      when ps.approved = true
       and ps.submitted_at >= date_trunc('month', current_date)
       and ps.submitted_at < date_trunc('month', current_date) + interval '1 month'
      then ps.points
      else 0
    end), 0)::integer as monthly_points
  from members m
  left join member_contacts mc on mc.member_id = m.id
  left join point_submissions ps on m.id = ps.member_id
  group by m.id, m.name, mc.email, m.role, m.is_officer, m.join_date
  order by role_priority, total_points desc, m.name;
end;
$function$;

-- Views that exposed members.email (unused by the app, kept for SQL/dashboard
-- use). Same columns; email now comes from member_contacts under the caller's
-- RLS.
create or replace view public.member_hierarchy
with (security_invoker = true) as
select
  m.id,
  m.name,
  mc.email,
  m.role,
  m.is_officer,
  m.join_date,
  case m.role
    when 'president' then 1
    when 'vice_president' then 2
    when 'officer' then 3
    when 'member' then 4
    else 5
  end as role_priority,
  case m.role
    when 'president' then 'President'
    when 'vice_president' then 'Vice President'
    when 'officer' then 'Officer'
    when 'member' then 'Member'
    else 'Unknown'
  end as role_display,
  case m.role
    when 'president' then true
    when 'vice_president' then true
    else false
  end as can_manage_officers
from public.members m
left join public.member_contacts mc on mc.member_id = m.id
order by 7, m.name;

create or replace view public.judge_assignment_summary
with (security_invoker = true) as
select
  cj.competition_id,
  c.name as competition_name,
  cj.judge_id,
  m.name as judge_name,
  mc.email as judge_email,
  cj.judge_role,
  cj.assigned_at,
  cj.active,
  count(distinct ce.id) as total_entries,
  count(distinct cjs.entry_id) as entries_judged,
  case
    when count(distinct ce.id) = 0 then 0::numeric
    else round(count(distinct cjs.entry_id)::numeric / count(distinct ce.id)::numeric * 100::numeric, 1)
  end as completion_percentage
from public.competition_judges cj
join public.competitions c on c.id = cj.competition_id
join public.members m on m.id = cj.judge_id
left join public.member_contacts mc on mc.member_id = m.id
left join public.competition_entries ce on ce.competition_id = cj.competition_id
left join public.competition_judging_sessions cjs
  on cjs.competition_id = cj.competition_id and cjs.judge_id = cj.judge_id
where cj.active = true
group by cj.competition_id, c.name, cj.judge_id, m.name, mc.email, cj.judge_role, cj.assigned_at, cj.active;

-- Finally remove the world-readable copies (also drops members_email_key;
-- uniqueness is enforced by member_contacts_email_key).
alter table public.members
  drop column email,
  drop column phone;

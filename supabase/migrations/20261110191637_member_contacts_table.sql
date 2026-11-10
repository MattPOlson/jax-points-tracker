-- Member contact privacy, step 1 of 2 (#153).
--
-- `members` is readable by every signed-in account (names are needed for the
-- leaderboard, results, judge lists, ...), and signup is open, so anyone who
-- registers could read every member's email and phone straight from the REST
-- API. RLS is row-level only, so the contact columns move to their own table
-- with an owner-or-officer policy.
--
-- This step is purely additive so the currently deployed app keeps working:
--   * create member_contacts and backfill it from members
--   * keep it in sync while old code still writes members.email / phone
--
-- Step 2 (the drop_member_contact_columns migration) drops the columns
-- from members and must only be applied once the app code that reads
-- member_contacts is deployed.

create table public.member_contacts (
  member_id uuid primary key references public.members(id) on delete cascade,
  email text unique,
  phone text,
  updated_at timestamptz not null default now()
);

comment on table public.member_contacts is
  'Member email/phone. Readable only by the member themselves and officers (#153).';

insert into public.member_contacts (member_id, email, phone)
select id, email, phone from public.members;

create trigger update_member_contacts_updated_at
  before update on public.member_contacts
  for each row execute function public.update_updated_at_column();

-- -------------------------------------------------------------
-- Access: owner or officer may read and update. Rows are created
-- by the signup trigger and removed by the members FK cascade, so
-- there are no client INSERT/DELETE policies or grants.
-- -------------------------------------------------------------
alter table public.member_contacts enable row level security;

revoke all on public.member_contacts from anon;
revoke insert, delete, truncate, references, trigger
  on public.member_contacts from authenticated;

create policy "Owner and officers can view contact details"
  on public.member_contacts for select to authenticated
  using (member_id = (select auth.uid()) or (select public.is_officer()));

create policy "Owner and officers can update contact details"
  on public.member_contacts for update to authenticated
  using (member_id = (select auth.uid()) or (select public.is_officer()))
  with check (member_id = (select auth.uid()) or (select public.is_officer()));

-- -------------------------------------------------------------
-- Transitional sync: until step 2, signup (handle_new_user) and the
-- deployed app still write members.email / members.phone. Mirror
-- those writes so nothing is lost when the columns are dropped.
-- Dropped again in step 2.
-- -------------------------------------------------------------
create or replace function public.members_sync_contacts()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE'
     and new.email is not distinct from old.email
     and new.phone is not distinct from old.phone then
    return new;
  end if;

  insert into public.member_contacts (member_id, email, phone)
  values (new.id, new.email, new.phone)
  on conflict (member_id) do update
    set email = excluded.email,
        phone = excluded.phone;

  return new;
end;
$$;

revoke execute on function public.members_sync_contacts() from public, anon, authenticated;

create trigger members_sync_contacts
  after insert or update of email, phone on public.members
  for each row execute function public.members_sync_contacts();

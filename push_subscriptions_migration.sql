-- Push subscriptions table for PWA push notifications
-- Run this migration in your Supabase SQL editor

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id) on delete cascade not null,
  endpoint text not null,
  subscription jsonb not null,
  created_at timestamptz default now(),
  -- Ensure one subscription per endpoint (a browser on a device)
  constraint unique_endpoint unique (endpoint)
);

-- Index for fast lookup by member
create index if not exists idx_push_subscriptions_member_id on push_subscriptions(member_id);

-- RLS policies
alter table push_subscriptions enable row level security;

-- Members can insert/delete their own subscriptions
create policy "Members can manage own subscriptions"
  on push_subscriptions
  for all
  using (member_id = auth.uid())
  with check (member_id = auth.uid());

-- Officers (via service role) can read all subscriptions to send notifications
-- (handled server-side with service role key, bypasses RLS)

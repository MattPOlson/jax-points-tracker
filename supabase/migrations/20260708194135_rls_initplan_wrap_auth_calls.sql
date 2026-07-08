-- #106: wrap auth.uid() / is_officer() / is_competition_judge() in scalar
-- subqueries so they evaluate once per statement (InitPlan) instead of per
-- row (advisor rule auth_rls_initplan). Semantics are unchanged.
-- ALTER POLICY (not drop/create) so there is no window without coverage.

-- competition_entries
alter policy "Members can delete own entries, officers any" on public.competition_entries
  using ((member_id = (select auth.uid())) or (select public.is_officer()));
alter policy "Members can edit own entries, officers any" on public.competition_entries
  using ((member_id = (select auth.uid())) or (select public.is_officer()))
  with check ((member_id = (select auth.uid())) or (select public.is_officer()));
alter policy "Members can submit own entries" on public.competition_entries
  with check ((member_id = (select auth.uid())) or (select public.is_officer()));

-- competition_judges
alter policy "Officers can assign judges" on public.competition_judges
  with check ((select public.is_officer()));
alter policy "Officers can delete judge assignments" on public.competition_judges
  using ((select public.is_officer()));
alter policy "Officers can update judge assignments" on public.competition_judges
  using ((select public.is_officer()))
  with check ((select public.is_officer()));

-- competition_judging_sessions
alter policy "Assigned judges can create own scoresheets" on public.competition_judging_sessions
  with check (((judge_id = (select auth.uid())) and (select public.is_competition_judge(competition_id))) or (select public.is_officer()));
alter policy "Assigned judges can update own scoresheets" on public.competition_judging_sessions
  using (((judge_id = (select auth.uid())) and (select public.is_competition_judge(competition_id))) or (select public.is_officer()))
  with check (((judge_id = (select auth.uid())) and (select public.is_competition_judge(competition_id))) or (select public.is_officer()));
alter policy "Judges, officers, and entry owners can view scoresheets" on public.competition_judging_sessions
  using ((judge_id = (select auth.uid())) or (select public.is_officer()) or (select public.is_competition_judge(competition_id)) or (exists (
    select 1 from public.competition_entries e
    where e.id = competition_judging_sessions.entry_id and e.member_id = (select auth.uid()))));

-- competition_ranking_groups
alter policy "Officers can manage ranking groups" on public.competition_ranking_groups
  using ((select public.is_officer()))
  with check ((select public.is_officer()));

-- competition_rankings
alter policy "Assigned judges can create own rankings" on public.competition_rankings
  with check (((judge_id = (select auth.uid())) and (select public.is_competition_judge(competition_id))) or (select public.is_officer()));
alter policy "Assigned judges can delete own rankings" on public.competition_rankings
  using ((judge_id = (select auth.uid())) or (select public.is_officer()));
alter policy "Assigned judges can update own rankings" on public.competition_rankings
  using ((judge_id = (select auth.uid())) or (select public.is_officer()))
  with check (((judge_id = (select auth.uid())) and (select public.is_competition_judge(competition_id))) or (select public.is_officer()));
alter policy "Rankings visible to judges, officers, or once published" on public.competition_rankings
  using ((judge_id = (select auth.uid())) or (select public.is_officer()) or (select public.is_competition_judge(competition_id)) or (exists (
    select 1 from public.competitions c
    where c.id = competition_rankings.competition_id and c.results_published = true)));

-- competition_results
alter policy "Members see published results, officers all" on public.competition_results
  using ((select public.is_officer()) or (exists (
    select 1 from public.competitions c
    where c.id = competition_results.competition_id and c.results_published = true)));
alter policy "Officers can record results" on public.competition_results
  with check ((select public.is_officer()));
alter policy "Officers can update results" on public.competition_results
  using ((select public.is_officer()))
  with check ((select public.is_officer()));

-- competitions
alter policy "Officers can create competitions" on public.competitions
  with check ((select public.is_officer()));
alter policy "Officers can delete competitions" on public.competitions
  using ((select public.is_officer()));
alter policy "Officers can update competitions" on public.competitions
  using ((select public.is_officer()))
  with check ((select public.is_officer()));

-- event_signups
alter policy "Members can delete own signup" on public.event_signups
  using ((member_id = (select auth.uid())) and (not (exists (
    select 1 from public.events
    where events.id = event_signups.event_id and events.locked = true))));
alter policy "Members can insert own signup" on public.event_signups
  with check ((member_id = (select auth.uid())) and (not (exists (
    select 1 from public.events
    where events.id = event_signups.event_id and events.locked = true))));
alter policy "Members can update own signup" on public.event_signups
  using ((member_id = (select auth.uid())) and (not (exists (
    select 1 from public.events
    where events.id = event_signups.event_id and events.locked = true))))
  with check ((member_id = (select auth.uid())) and (not (exists (
    select 1 from public.events
    where events.id = event_signups.event_id and events.locked = true))));
alter policy "Officers can manage signups" on public.event_signups
  using ((select public.is_officer()))
  with check ((select public.is_officer()));

-- events
alter policy "Officers can manage events" on public.events
  using ((select public.is_officer()))
  with check ((select public.is_officer()));

-- forum_categories (these predate is_officer() and inline the members lookup)
alter policy "Members can view non-officer categories" on public.forum_categories
  using ((officer_only = false) or (exists (
    select 1 from public.members
    where members.id = (select auth.uid()) and members.is_officer = true)));
alter policy "Officers can manage categories" on public.forum_categories
  using ((exists (select 1 from public.members where members.id = (select auth.uid()) and members.is_officer = true)))
  with check ((exists (select 1 from public.members where members.id = (select auth.uid()) and members.is_officer = true)));

-- forum_posts
alter policy "Authors can edit own posts within window" on public.forum_posts
  using ((author_id = (select auth.uid())) and (deleted_at is null) and ((now() - created_at) < interval '24 hours'))
  with check ((author_id = (select auth.uid())));
alter policy "Members can create posts" on public.forum_posts
  with check ((author_id = (select auth.uid())) and (exists (
    select 1 from public.forum_topics t
    join public.forum_categories c on c.id = t.category_id
    where t.id = forum_posts.topic_id and t.locked = false and c.officer_only = false and c.members_can_post = true)));
alter policy "Members can view posts in visible topics" on public.forum_posts
  using ((exists (
    select 1 from public.forum_topics t
    join public.forum_categories c on c.id = t.category_id
    where t.id = forum_posts.topic_id and (c.officer_only = false or (exists (
      select 1 from public.members
      where members.id = (select auth.uid()) and members.is_officer = true)))))
  and ((deleted_at is null) or (exists (
    select 1 from public.members
    where members.id = (select auth.uid()) and members.is_officer = true))));
alter policy "Officers can create posts anywhere" on public.forum_posts
  with check ((author_id = (select auth.uid())) and (exists (
    select 1 from public.members
    where members.id = (select auth.uid()) and members.is_officer = true)));
alter policy "Officers can edit any post" on public.forum_posts
  using ((exists (select 1 from public.members where members.id = (select auth.uid()) and members.is_officer = true)));

-- forum_topics
alter policy "Authors can edit own topics within window" on public.forum_topics
  using ((author_id = (select auth.uid())) and ((now() - created_at) < interval '15 minutes'))
  with check ((author_id = (select auth.uid())));
alter policy "Members can create topics" on public.forum_topics
  with check ((author_id = (select auth.uid())) and (exists (
    select 1 from public.forum_categories c
    where c.id = forum_topics.category_id and c.officer_only = false and c.members_can_post = true)));
alter policy "Members can view topics in visible categories" on public.forum_topics
  using ((exists (
    select 1 from public.forum_categories c
    where c.id = forum_topics.category_id and (c.officer_only = false or (exists (
      select 1 from public.members
      where members.id = (select auth.uid()) and members.is_officer = true))))));
alter policy "Officers can create topics anywhere" on public.forum_topics
  with check ((author_id = (select auth.uid())) and (exists (
    select 1 from public.members
    where members.id = (select auth.uid()) and members.is_officer = true)));
alter policy "Officers can delete topics" on public.forum_topics
  using ((exists (select 1 from public.members where members.id = (select auth.uid()) and members.is_officer = true)));
alter policy "Officers can edit any topic" on public.forum_topics
  using ((exists (select 1 from public.members where members.id = (select auth.uid()) and members.is_officer = true)));

-- judging_tables
alter policy "Officers can manage judging tables" on public.judging_tables
  using ((select public.is_officer()))
  with check ((select public.is_officer()));

-- members: merge the two permissive UPDATE policies (advisor
-- multiple_permissive_policies) into one, wrapped. The column-level
-- restrictions live in the members_restrict_privileged_updates trigger,
-- which is unaffected.
drop policy "Officers can update members" on public.members;
drop policy "Members can update own profile" on public.members;
create policy "Members update own profile, officers any" on public.members
  for update to authenticated
  using ((id = (select auth.uid())) or (select public.is_officer()))
  with check ((id = (select auth.uid())) or (select public.is_officer()));

-- point_submissions
alter policy "Members can submit own unapproved points" on public.point_submissions
  with check ((member_id = (select auth.uid())) and (approved is not true));
alter policy "Members see approved, own, or all if officer" on public.point_submissions
  using ((approved = true) or (member_id = (select auth.uid())) or (select public.is_officer()));
alter policy "Officers can review others' submissions" on public.point_submissions
  using ((select public.is_officer()) and (member_id <> (select auth.uid())))
  with check ((select public.is_officer()) and (member_id <> (select auth.uid())));

-- push_subscriptions
alter policy "Officers and owners can view push subscriptions" on public.push_subscriptions
  using ((member_id = (select auth.uid())) or (select public.is_officer()));

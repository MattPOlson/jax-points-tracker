-- Pin search_path on every public function that still had a mutable one (#139).
--
-- A function with no search_path set resolves its unqualified object
-- references against the *caller's* search_path, which the caller can change.
-- Pinning it removes that mutability (Supabase linter 0011): pg_catalog is
-- still searched implicitly-first so built-ins can't be shadowed, and `public`
-- objects can only be shadowed by someone with CREATE on the schema — which
-- `authenticated` does not have.
--
-- `SET search_path TO 'public'` matches the functions already hardened this
-- way (is_officer, is_competition_judge, members_restrict_privileged_updates,
-- competition_entries_restrict_member_writes). This is a config-only change —
-- no function body is rewritten, so behaviour is unchanged.
--
-- SECURITY DEFINER functions are the higher-risk cases (they run with the
-- owner's privileges) and are listed first.

-- SECURITY DEFINER
alter function public.get_active_competitions() set search_path to 'public';
alter function public.get_bjcp_categories() set search_path to 'public';
alter function public.get_competitions_with_stats() set search_path to 'public';
alter function public.handle_new_user() set search_path to 'public';

-- SECURITY INVOKER — trigger functions
alter function public.forum_posts_after_insert() set search_path to 'public';
alter function public.forum_posts_before_update() set search_path to 'public';
alter function public.forum_posts_restrict_member_updates() set search_path to 'public';
alter function public.forum_topics_restrict_member_updates() set search_path to 'public';
alter function public.sync_officer_status() set search_path to 'public';
alter function public.update_updated_at_column() set search_path to 'public';
alter function public.validate_competition_entry_category() set search_path to 'public';
alter function public.validate_intraclub_self_ranking() set search_path to 'public';

-- SECURITY INVOKER — read RPCs / helpers
alter function public.generate_entry_number() set search_path to 'public';
alter function public.get_competition_allowed_categories(uuid) set search_path to 'public';
alter function public.get_competition_ranking_groups(uuid) set search_path to 'public';
alter function public.get_leaderboard(integer) set search_path to 'public';
alter function public.get_members_with_points() set search_path to 'public';
alter function public.get_submission_years() set search_path to 'public';

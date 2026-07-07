-- Follow-up to enable_rls_all_tables: function EXECUTE is granted to
-- PUBLIC by default, so revoking from anon alone was not enough.

-- Trigger functions: never client-callable.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.members_restrict_privileged_updates() from public, anon, authenticated;
revoke execute on function public.competition_entries_restrict_member_writes() from public, anon, authenticated;

-- Data RPCs: signed-in members only.
revoke execute on function public.get_active_competitions() from public, anon;
revoke execute on function public.get_bjcp_categories() from public, anon;
revoke execute on function public.get_competitions_with_stats() from public, anon;
grant execute on function public.get_active_competitions() to authenticated;
grant execute on function public.get_bjcp_categories() to authenticated;
grant execute on function public.get_competitions_with_stats() to authenticated;

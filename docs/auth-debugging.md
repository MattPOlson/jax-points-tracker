# Auth debugging: where login events actually live

Notes from the #50 Discord identity-linking verification (2026-07-10). See issue #124.

## TL;DR

| Signal | Maintained? | Use for |
|---|---|---|
| `auth.audit_log_entries` | ✅ every auth event, with provider | **Source of truth** for logins, logouts, signups, token refreshes |
| `auth.users.last_sign_in_at` | ✅ on every sign-in | "When did this user last authenticate" (no provider attribution) |
| `public.members.last_login_at` | ✅ app-maintained | Portal-level last login (updated by the root layout ~2s after sign-in) |
| `auth.identities.last_sign_in_at` | ❌ **never updated after creation** | Nothing — do not trust it |

## The trap

`auth.identities.last_sign_in_at` looks like "when was this identity last used to sign in." It is not. GoTrue sets it at identity creation and never touches it again:

- A long-standing email identity on an active account showed `last_sign_in_at = 2025-05-21` (its creation time) despite daily email logins since, including one the same morning it was checked.
- A freshly linked Discord identity kept `last_sign_in_at == created_at` even after two successful Discord sign-ins minutes later.

Any query like "which members actually use Discord to sign in" built on this column silently reports garbage.

## The source of truth

```sql
select created_at,
       payload->>'action' as action,
       payload->>'actor_username' as actor,
       coalesce(payload->'traits'->>'provider', payload->>'provider') as provider
from auth.audit_log_entries
where payload->>'actor_id' = '<auth user uuid>'   -- omit for all users
order by created_at desc
limit 50;
```

Actions observed in this project: `login` (with `provider: email | discord`), `logout`, `token_refreshed`, `token_revoked`, `user_signedup`, `user_recovery_requested`.

### Example: Discord adoption report

```sql
select date_trunc('day', created_at) as day, count(*) as discord_logins,
       count(distinct payload->>'actor_id') as distinct_members
from auth.audit_log_entries
where payload->>'action' = 'login'
  and coalesce(payload->'traits'->>'provider', payload->>'provider') = 'discord'
group by 1 order by 1 desc;
```

## Caveats

- **Retention**: hosted Supabase prunes `audit_log_entries` (retention depends on plan). Long-range reporting needs periodic snapshots into an app table.
- The audit log is in the `auth` schema — query it via the Supabase SQL editor or a service-role connection, never from the client.
- Identity *existence* (is Discord linked?) is fine to read from `auth.identities` / `getUserIdentities()` — it's only the `last_sign_in_at` column that lies.

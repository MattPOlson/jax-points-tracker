// Member email/phone live in `member_contacts`, not `members` (#153).
//
// `members` is readable by every signed-in account, so contact details sit in
// their own table whose RLS only lets the member themselves and officers read
// or update a row. For everyone else the embedded select below simply yields
// `email: null, phone: null`.
import { supabase } from '$lib/supabaseClient';

/**
 * Columns of `members` every signed-in member may read, plus the caller's
 * view of the contact row flattened onto the same object (PostgREST spread
 * embed), so consumers keep using `member.email` / `member.phone`.
 */
export const MEMBER_PROFILE_COLUMNS =
  'id, name, is_officer, join_date, last_login_at, active, role, ...member_contacts(email, phone)';

/**
 * Update a member's contact details. RLS allows this for the member's own row
 * and for officers; a refused update affects zero rows without raising, so
 * that case is surfaced as an error here.
 *
 * @param {string} memberId
 * @param {{ email?: string | null, phone?: string | null }} changes
 * @returns {Promise<{ email: string | null, phone: string | null }>}
 */
export async function updateMemberContact(memberId, changes) {
  const { data, error } = await supabase
    .from('member_contacts')
    .update(changes)
    .eq('member_id', memberId)
    .select('email, phone');

  if (error) throw error;
  if (!data?.length) {
    throw new Error('Contact details were not updated (not permitted or member not found).');
  }
  return data[0];
}

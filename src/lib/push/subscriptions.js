// Shared "who's subscribed" reach data for officer tooling.
//
// Both the member roster (#135) and the notification send page (#134) need to
// know which members receive push notifications. A member can have several
// subscribed devices, so the source of truth is one row per device in
// push_subscriptions. Officers may read every row via the
// "Officers and owners can view push subscriptions" RLS policy (#96), so this
// is a single aggregate query — never per-member (N+1).
import { supabase } from '$lib/supabaseClient';

/**
 * Fetch push-subscription device counts keyed by member_id.
 *
 * @returns {Promise<Map<string, number>>} member_id → number of subscribed
 *   devices. Members with no subscriptions are simply absent from the map.
 */
export async function fetchSubscriptionCounts() {
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('member_id');

  if (error) throw error;

  const counts = new Map();
  for (const row of data ?? []) {
    if (!row.member_id) continue; // orphaned rows shouldn't gate reach math
    counts.set(row.member_id, (counts.get(row.member_id) ?? 0) + 1);
  }
  return counts;
}

import { writable } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';

export const approvals = writable([]);
export const message = writable('');
let lastLoaded = 0;
const CACHE_MS = 10000;

export async function loadApprovals(force = false) {
  if (!force && Date.now() - lastLoaded < CACHE_MS) return;

  const { data, error } = await supabase
    .from('point_submissions')
    .select(`
      id,
      category,
      description,
      points,
      event_date,
      member_id,
      member:member_id ( name )
    `)
    .eq('approved', false)
    .order('event_date', { ascending: false });

  lastLoaded = Date.now();

  if (error) {
    console.error('Supabase query error:', error);
    message.set(`Failed to load submissions: ${error.message}`);
    approvals.set([]);
    return;
  }

  approvals.set(data);
  message.set(data.length === 0 ? 'No pending submissions found to review.' : '');
}

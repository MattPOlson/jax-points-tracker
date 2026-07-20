import { writable } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';

export const allSubmissions = writable([]);
export const message = writable('');
export const loading = writable(false);

let lastLoaded = 0;
const CACHE_MS = 10000;

// The view-all page filters and sorts client-side across the whole result, so
// this still loads a single set rather than true server-side pagination — but
// it's now bounded. At ~173 rows this is generous headroom; the cap keeps the
// worst case from shipping an unbounded table as club history grows (#108).
const MAX_ROWS = 2000;

export async function loadAllSubmissions(force = false) {
  if (!force && Date.now() - lastLoaded < CACHE_MS) return;

  loading.set(true);

  const { data, error } = await supabase
    .from('point_submissions')
    .select(`id, category, description, points, event_date, submitted_at, approved, rejection_reason, members(name)`)
    .order('event_date', { ascending: false })
    .limit(MAX_ROWS);

  lastLoaded = Date.now();

  if (!error) {
    allSubmissions.set(data);
    // Surface truncation instead of silently dropping older rows once the
    // table outgrows the cap.
    message.set(
      data.length >= MAX_ROWS ? `Showing the most recent ${MAX_ROWS} submissions.` : ''
    );
  } else {
    console.error('Error loading submissions:', error);
    allSubmissions.set([]);
    message.set('Failed to load all submissions.');
  }

  loading.set(false);
}

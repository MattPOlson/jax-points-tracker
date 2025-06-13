import { writable } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';

export const allSubmissions = writable([]);
let lastLoaded = 0;
const CACHE_MS = 10000;

export async function loadAllSubmissions(force = false) {
  if (!force && Date.now() - lastLoaded < CACHE_MS) return;

  const { data, error } = await supabase
    .from('point_submissions')
    .select(`id, category, description, points, event_date, approved, rejection_reason, members(name)`)
    .order('event_date', { ascending: false });

  lastLoaded = Date.now();

  if (!error) {
    allSubmissions.set(data);
  } else {
    console.error('Error loading submissions:', error);
    allSubmissions.set([]);
  }
}

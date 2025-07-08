import { writable } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';
import { browser } from '$app/environment';

export const allSubmissions = writable([]);
export const message = writable('');
export const loading = writable(false);

let lastLoaded = 0;
const CACHE_MS = 10000;

export async function loadMySubmissions(userId, sortColumn = 'event_date', sortDirection = 'desc', force = false) {
  if (!userId) {
    message.set('Please log in to view your submissions.');
    allSubmissions.set([]);
    return;
  }

  if (!force && Date.now() - lastLoaded < CACHE_MS) return;

  loading.set(true);

  const { data, error } = await supabase
    .from('point_submissions')
    .select(`id, category, description, points, event_date, approved, rejection_reason`)
    .eq('member_id', userId)
    .order(sortColumn, { ascending: sortDirection === 'asc' });

  lastLoaded = Date.now();

  if (error) {
    console.error('Error loading submissions:', error);
    message.set('Error loading your submissions.');
    allSubmissions.set([]);
    loading.set(false);
    return;
  }

  allSubmissions.set(data);
  message.set('');
  loading.set(false);
}
import { writable } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';

export const leaderboard = writable([]);
export const message = writable('');
export const loading = writable(false);
export const availableYears = writable([]);
export const selectedYear = writable(new Date().getFullYear());

const CACHE_MS = 10000;
const cache = new Map(); // year -> { data, loadedAt }

export async function loadAvailableYears() {
  const { data, error } = await supabase
    .from('point_submissions')
    .select('event_date')
    .eq('approved', true)
    .not('event_date', 'is', null);

  if (error || !data) return;

  const years = [...new Set(data.map(r => new Date(r.event_date + 'T00:00:00').getFullYear()))]
    .filter(y => !isNaN(y))
    .sort((a, b) => b - a);

  // Always include current year even if no data yet
  const currentYear = new Date().getFullYear();
  if (!years.includes(currentYear)) years.unshift(currentYear);

  availableYears.set(years);
}

export async function loadLeaderboard(year, force = false) {
  const cached = cache.get(year);
  if (!force && cached && Date.now() - cached.loadedAt < CACHE_MS) {
    leaderboard.set(cached.data);
    message.set('');
    return;
  }

  loading.set(true);

  const { data, error } = await supabase
    .from('point_submissions')
    .select(`
      points,
      member_id,
      members(id, name)
    `)
    .eq('approved', true)
    .gte('event_date', `${year}-01-01`)
    .lte('event_date', `${year}-12-31`);

  if (error) {
    console.error('Error loading leaderboard:', error);
    message.set('Failed to load leaderboard.');
    leaderboard.set([]);
    loading.set(false);
    return;
  }

  const totals = new Map();
  for (const entry of data) {
    const id = entry.members?.id;
    const name = entry.members?.name;
    const points = entry.points || 0;
    if (!id || !name) continue;
    if (!totals.has(id)) totals.set(id, { name, points: 0 });
    totals.get(id).points += points;
  }

  const sorted = Array.from(totals.values()).sort((a, b) => b.points - a.points);

  cache.set(year, { data: sorted, loadedAt: Date.now() });
  leaderboard.set(sorted);
  message.set('');
  loading.set(false);
}

import { writable } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';

export const leaderboard = writable([]);
export const message = writable('');

let lastLoaded = 0;
const CACHE_MS = 10000;

export async function loadLeaderboard(force = false) {
  if (!force && Date.now() - lastLoaded < CACHE_MS) return;

  const { data, error } = await supabase
    .from('point_submissions')
    .select(`
      points,
      approved,
      member_id,
      members(id, name)
    `)
    .eq('approved', true);

  lastLoaded = Date.now();

  if (error) {
    console.error('Error loading leaderboard:', error);
    message.set('Failed to load leaderboard.');
    leaderboard.set([]);
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

  leaderboard.set(
    Array.from(totals.values())
      .sort((a, b) => b.points - a.points)
      .slice(0, 10)
  );
  message.set('');
}

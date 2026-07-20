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
  // Distinct years are computed in the DB (get_submission_years) instead of
  // shipping every approved row's event_date to derive ~5 values client-side.
  const { data, error } = await supabase.rpc('get_submission_years');

  if (error || !data) return;

  const years = data
    .map((y) => Number(y))
    .filter((y) => !isNaN(y))
    .sort((a, b) => b - a);

  // Always include current year even if no data yet
  const currentYear = new Date().getFullYear();
  if (!years.includes(currentYear)) years.unshift(currentYear);

  availableYears.set(years);
}

export async function loadLeaderboard(year, force = false) {
  // Guard: only a real 4-digit-ish year may reach the date range. Callers that
  // fumble the (year, force) signature — e.g. loadLeaderboard(true) — would
  // otherwise build `event_date >= "true-01-01"` and 400 against Postgres (#117).
  if (!Number.isInteger(year) || year < 1970) {
    year = new Date().getFullYear();
  }

  const cached = cache.get(year);
  if (!force && cached && Date.now() - cached.loadedAt < CACHE_MS) {
    leaderboard.set(cached.data);
    message.set('');
    return;
  }

  loading.set(true);

  // Aggregation happens in the DB (get_leaderboard) — one row per member,
  // already summed and ordered — rather than shipping every approved row and
  // summing in a JS Map.
  const { data, error } = await supabase.rpc('get_leaderboard', { p_year: year });

  if (error) {
    console.error('Error loading leaderboard:', error);
    message.set('Failed to load leaderboard.');
    leaderboard.set([]);
    loading.set(false);
    return;
  }

  // total_points comes back as a bigint; normalise to a number for the UI,
  // which calls .toLocaleString() on it.
  const sorted = (data ?? []).map((row) => ({
    name: row.name,
    points: Number(row.total_points) || 0
  }));

  cache.set(year, { data: sorted, loadedAt: Date.now() });
  leaderboard.set(sorted);
  message.set('');
  loading.set(false);
}

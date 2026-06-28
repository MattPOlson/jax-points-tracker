// Club Calendar Store
// Read-only mirror of the club Google Calendar. Google Calendar is the
// source of truth; this store just fetches normalized events from
// /api/calendar for display.
import { writable, derived, get } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';

// =============================================
// Store State
// =============================================

export const events = writable([]);
export const isLoading = writable(false);
export const error = writable(null);
export const lastRefresh = writable(null);

// =============================================
// Derived: events grouped by month for an agenda view
// =============================================

export const eventsByMonth = derived(events, ($events) => {
  if (!Array.isArray($events) || $events.length === 0) return [];

  const groups = new Map();
  for (const ev of $events) {
    if (!ev.start) continue;
    const d = new Date(ev.start);
    if (isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        events: []
      });
    }
    groups.get(key).events.push(ev);
  }

  return Array.from(groups.values());
});

// =============================================
// Loader
// =============================================

export async function loadCalendar(forceRefresh = false) {
  const now = new Date();
  const lastRefreshTime = get(lastRefresh);

  // Debounce repeat loads (the server also caches for 10 minutes).
  if (!forceRefresh && lastRefreshTime && now - lastRefreshTime < 30000) {
    return;
  }

  isLoading.set(true);
  error.set(null);

  try {
    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error('You must be signed in to view the calendar.');
    }

    const res = await fetch('/api/calendar', {
      headers: { Authorization: `Bearer ${session.access_token}` }
    });

    if (!res.ok) {
      let message = 'Failed to load calendar';
      try {
        const body = await res.json();
        message = body?.message || message;
      } catch {
        // non-JSON error response; keep default message
      }
      throw new Error(message);
    }

    const body = await res.json();
    events.set(body.events || []);
    lastRefresh.set(now);
  } catch (err) {
    console.error('Failed to load calendar:', err);
    error.set(err.message || 'Failed to load calendar');
    events.set([]);
  } finally {
    isLoading.set(false);
  }
}

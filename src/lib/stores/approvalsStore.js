import { writable } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';
import { browser } from '$app/environment';

export const approvals = writable([]);
export const message = writable('');
export const loading = writable(false);

let lastLoaded = 0;
const CACHE_MS = 10000;

// ✅ Restore from localStorage safely (after hydration)
if (browser) {
  setTimeout(() => {
    try {
      const stored = localStorage.getItem('approvals');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          approvals.set(parsed);
        }
      }

      approvals.subscribe((val) => {
        try {
          localStorage.setItem('approvals', JSON.stringify(val));
        } catch (e) {
          console.warn('Failed to store approvals:', e);
        }
      });
    } catch (e) {
      console.warn('Failed to access localStorage for approvals:', e);
    }
  }, 0);
}

export async function loadApprovals(force = false) {
  if (!force && Date.now() - lastLoaded < CACHE_MS) return;

  loading.set(true);

  const { data, error } = await supabase
    .from('point_submissions')
    .select(`
      id,
      category,
      description,
      points,
      event_date,
      submitted_at,
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
    loading.set(false);
    return;
  }

  approvals.set(data);
  message.set(data.length === 0 ? 'No pending submissions found to review.' : '');
  loading.set(false);
}

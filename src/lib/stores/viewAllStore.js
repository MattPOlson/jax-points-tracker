import { writable } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';
import { browser } from '$app/environment';

export const allSubmissions = writable([]);
export const message = writable('');
export const loading = writable(false);

let lastLoaded = 0;
const CACHE_MS = 10000;

export async function loadAllSubmissions(force = false) {
  if (!force && Date.now() - lastLoaded < CACHE_MS) return;

  loading.set(true);

  const { data, error } = await supabase
    .from('point_submissions')
    .select(`id, category, description, points, event_date, approved, rejection_reason, members(name)`)
    .order('event_date', { ascending: false });

  lastLoaded = Date.now();

  if (!error) {
    console.log('[viewAll] Supabase returned:', data); // ✅ Add this for debugging
    allSubmissions.set(data);
    message.set('');
  } else {
    console.error('Error loading submissions:', error);
    allSubmissions.set([]);
    message.set('Failed to load all submissions.');
  }

  loading.set(false);
}

if (browser) {
  setTimeout(() => {
    try {
      const stored = localStorage.getItem('viewAllSubmissions');
      if (stored) {
        let parsed = JSON.parse(stored);
        allSubmissions.update((current) => {
          return Array.isArray(current) && current.length > 0 ? current : parsed;
        });
      }

      allSubmissions.subscribe((val) => {
        try {
          localStorage.setItem('viewAllSubmissions', JSON.stringify(val));
        } catch (e) {
          console.warn('Error saving viewAllSubmissions to localStorage:', e);
        }
      });
    } catch (e) {
      console.warn('viewAll localStorage error:', e);
    }
  }, 0);
}
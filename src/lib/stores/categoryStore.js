import { writable } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';

export const categories = writable([]);
export const placementOptions = writable([]);
export const monthlyEvents = writable([]);
export const floridaCircuitEvents = writable([]);

export const isLoaded = writable(false);
export const isLoading = writable(false);

let lastFetched = 0;

export async function loadCategoryData(force = false) {
  const now = Date.now();
  if (!force && now - lastFetched < 10_000) return;

  isLoading.set(true);

  try {
    const [catRes, placementRes, monthlyRes, floridaRes] = await Promise.all([
      supabase.from('categories').select('*').eq('active', true),
      supabase.from('point_categories').select('*').eq('active', true),
      supabase.from('monthly_challenge').select('*').eq('active', true),
      supabase.from('florida_circuit_events').select('*').eq('active', true),
    ]);

    if (catRes.error || placementRes.error || monthlyRes.error || floridaRes.error) {
      console.error('Supabase query failed:', { catRes, placementRes, monthlyRes, floridaRes });
      throw catRes.error || placementRes.error || monthlyRes.error || floridaRes.error;
    }

    categories.set(catRes.data);
    placementOptions.set(placementRes.data);
    monthlyEvents.set(monthlyRes.data);
    floridaCircuitEvents.set(floridaRes.data);

    lastFetched = now;
    isLoaded.set(true);
  } catch (err) {
    console.error('❌ Failed to load category data:', err);
    isLoaded.set(false);
  } finally {
    isLoading.set(false); // 🔐 always release the gate
  }
}

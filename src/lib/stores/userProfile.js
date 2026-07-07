import { writable, get } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';

export const userProfile = writable(null);
export const isLoadingProfile = writable(false);

let lastLoaded = 0;
const CACHE_MS = 10000; // 10 seconds cache

export function resetUserProfile() {
  userProfile.set(null);
  isLoadingProfile.set(false);
  lastLoaded = 0;
}

/**
 * Single fetch path for the signed-in member's profile (#76).
 *
 * Returns the profile row, or null when there is no auth user or no matching
 * members row. Throws on unexpected/transient failures (network, DB) WITHOUT
 * clobbering an already-loaded profile, so callers can distinguish
 * "couldn't verify" from "verified absent" (see officers/+layout).
 *
 * History (#61): this used to defer userProfile.set() with setTimeout(0)
 * (commit 972b83e) as a tab-switch staleness workaround. The real fix for the
 * supabase-js auth-lock hang on tab refocus is deferring work out of
 * onAuthStateChange, which the root layout does. The store now sets the
 * profile synchronously and BEFORE isLoadingProfile flips false, so there is
 * no window where the profile is null-but-not-loading.
 *
 * @param {boolean} force bypass the cache
 * @returns {Promise<object | null>}
 */
export async function loadUserProfile(force = false) {
  if (!force && Date.now() - lastLoaded < CACHE_MS) return get(userProfile);

  isLoadingProfile.set(true);

  try {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      userProfile.set(null);
      return null;
    }

    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      // No members row for this auth user — a definitive answer, not a failure.
      if (error.code === 'PGRST116') {
        userProfile.set(null);
        lastLoaded = Date.now();
        return null;
      }
      throw error;
    }

    userProfile.set(data);
    lastLoaded = Date.now();
    return data;
  } finally {
    isLoadingProfile.set(false);
  }
}

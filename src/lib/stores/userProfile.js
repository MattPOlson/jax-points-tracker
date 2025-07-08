import { writable } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';

export const userProfile = writable(null);
export const isLoadingProfile = writable(false);

let lastLoaded = 0;
const CACHE_MS = 10000; // 10 seconds cache

// Simple reset function - only addition to your original  
export function resetUserProfile() {
  console.log('🔄 Resetting user profile store');
  userProfile.set(null);
  isLoadingProfile.set(false);
  lastLoaded = 0;
}

export async function loadUserProfile(force = false) {
  if (!force && Date.now() - lastLoaded < CACHE_MS) return;

  isLoadingProfile.set(true);

  try {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('User not logged in or failed to retrieve auth user:', authError);
      userProfile.set(null);
      return;
    }

    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Failed to load user profile:', error);
      userProfile.set(null);
    } else {
      userProfile.set(data);
      lastLoaded = Date.now();
    }
  } catch (err) {
    console.error('❌ Failed to load user profile:', err);
    userProfile.set(null);
  } finally {
    isLoadingProfile.set(false);
  }
}
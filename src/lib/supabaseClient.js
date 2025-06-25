import { createClient } from '@supabase/supabase-js';
import { browser } from '$app/environment';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}
if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

// Only log in browser environment
if (browser) {
  console.log('Supabase URL:', supabaseUrl);
  console.log('Supabase Key:', supabaseAnonKey ? 'Exists' : 'Missing');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'jax-points-tracker-auth',
    storage: {
      getItem: (key) => {
        if (!browser) return null;
        return localStorage.getItem(key);
      },
      setItem: (key, value) => {
        if (!browser) return;
        localStorage.setItem(key, value);
      },
      removeItem: (key) => {
        if (!browser) return;
        localStorage.removeItem(key);
      }
    }
  }
});

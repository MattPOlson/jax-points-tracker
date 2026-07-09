import { createClient } from '@supabase/supabase-js';
import { browser } from '$app/environment';
import { createRetryFetch } from '$lib/utils/retryFetch';

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

// supabase-js resolves a WebSocket implementation for realtime eagerly inside
// createClient(), which throws during SSR on Node < 22 ("native WebSocket not
// found") and 500s every server-rendered page (#99). This app never opens
// realtime channels — and certainly not on the server — so give the server
// client an inert transport; the realtime lookup then never touches the
// runtime's WebSocket. Browser clients keep the default (native) transport.
class NoopWebSocket {
  constructor() {
    this.readyState = 3; // CLOSED
  }
  close() {}
  send() {}
  addEventListener() {}
  removeEventListener() {}
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  ...(browser ? {} : { realtime: { transport: NoopWebSocket } }),
  // Retry transient upstream 5xx/network blips on idempotent requests so a
  // one-off auth/DB timeout never surfaces to the user (#118).
  global: { fetch: createRetryFetch() },
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

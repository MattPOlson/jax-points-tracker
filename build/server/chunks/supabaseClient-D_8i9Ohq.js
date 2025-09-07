import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ftdradvuyhumgrjrsmkp.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZHJhZHZ1eWh1bWdyanJzbWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NjY1NjQsImV4cCI6MjA2MzM0MjU2NH0.SxWO5NdfiyM36KeSWof2DP5H18FmE7inlwJw8yQINqk";
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "jax-points-tracker-auth",
    storage: {
      getItem: (key) => {
        return null;
      },
      setItem: (key, value) => {
        return;
      },
      removeItem: (key) => {
        return;
      }
    }
  }
});

export { supabase as s };
//# sourceMappingURL=supabaseClient-D_8i9Ohq.js.map

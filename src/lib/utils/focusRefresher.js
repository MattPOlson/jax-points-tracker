import { onMount } from 'svelte';

// DEPRECATED: This utility was causing Supabase tab switching issues
// Tab visibility handlers that trigger page reloads conflict with auth state management
export function onTabFocus(callback) {
  console.warn('onTabFocus is deprecated due to Supabase tab switching conflicts');
  
  // Return no-op to avoid breaking existing code while discouraging usage
  return () => {};
}

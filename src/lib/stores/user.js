import { writable } from 'svelte/store';

/** @type {import('svelte/store').Writable<import('@supabase/supabase-js').User | null>} */
export const user = writable(null); 
import { writable } from 'svelte/store';

/** 
 * Holds the full “members” row for the logged‑in user. 
 * Replace `object` with a more specific type if you have one.
 * @type {import('svelte/store').Writable<object | null>} 
 */
export const userProfile = writable(null);

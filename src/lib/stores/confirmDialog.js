import { writable } from 'svelte/store';

/**
 * Global confirm dialog store.
 * Use `showConfirm(message, title?)` from any component — it returns a Promise<boolean>.
 */

export const confirmState = writable({
  open: false,
  title: '',
  message: '',
  resolve: null
});

/**
 * Show a styled confirmation dialog.
 * @param {string} message
 * @param {string} [title]
 * @returns {Promise<boolean>}
 */
export function showConfirm(message, title = 'Confirm') {
  return new Promise((resolve) => {
    confirmState.set({ open: true, title, message, resolve });
  });
}

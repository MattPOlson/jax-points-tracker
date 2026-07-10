/**
 * IndexedDB parking spot for a tapped push notification (#130 cold-start fix).
 *
 * The service worker hands notification content to the page via query params,
 * but when the OS launches a fully-closed PWA the launch flow can drop them.
 * IndexedDB is the one storage both contexts share (service workers cannot
 * touch localStorage), so the SW also parks the content here and the popup
 * component consumes it as a fallback.
 *
 * Plain functions only — imported by both the service worker bundle and
 * NotificationPopup.svelte.
 */

const DB_NAME = 'jax-push';
const STORE = 'pending';
const KEY = 'last';

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** @param {{ title: string, body: string, ts: number }} data */
export async function savePendingNotification(data) {
  const db = await openDb();
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(data, KEY);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

/**
 * Read AND delete the parked notification. Returns null when there is none
 * or it is older than maxAgeMs (a stale record from a launch that never
 * completed must not pop up days later).
 * @param {number} maxAgeMs
 */
export async function takePendingNotification(maxAgeMs) {
  const db = await openDb();
  let record;
  try {
    record = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      const get = store.get(KEY);
      get.onsuccess = () => {
        store.delete(KEY);
        resolve(get.result ?? null);
      };
      get.onerror = () => reject(get.error);
    });
  } finally {
    db.close();
  }
  if (!record || typeof record.ts !== 'number') return null;
  if (Date.now() - record.ts > maxAgeMs) return null;
  return record;
}

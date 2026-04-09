/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

const sw = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self));

const CACHE = `jax-cache-${version}`;

// Assets to precache: built app + static files (excluding large images)
const ASSETS = [
  ...build,
  ...files.filter(f => !f.match(/\.(png|jpg|svg)$/) || f.includes('icons/'))
];

sw.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      // Cache assets individually so one failure doesn't abort the whole install.
      // A cold Cloud Run start or transient network blip on any single asset
      // would otherwise prevent the service worker from ever becoming active.
      await Promise.allSettled(
        ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[SW] Failed to cache ${url}:`, err);
          })
        )
      );
    }).then(() => sw.skipWaiting())
  );
});

sw.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
      )
      .then(() => sw.clients.claim())
  );
});

sw.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Don't cache Supabase API requests
  if (url.hostname.includes('supabase')) return;

  // For navigation requests: network first, fall back to cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // For cached assets: cache first, fall back to network on miss
  if (ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
    return;
  }

  // Everything else: network only
});

// Push notification handler
sw.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};

  event.waitUntil(
    sw.registration.showNotification(data.title || 'JAX Members Portal', {
      body: data.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: data.tag || 'jax-notification',
      data: { url: data.url || '/' }
    })
  );
});

// Notification click handler
sw.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    sw.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        if (sw.clients.openWindow) {
          return sw.clients.openWindow(url);
        }
      })
  );
});

// Handle expired subscriptions
sw.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    sw.registration.pushManager
      .subscribe(event.oldSubscription.options)
      .then((subscription) =>
        fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription })
        })
      )
  );
});

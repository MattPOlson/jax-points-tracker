/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';
import { savePendingNotification } from '$lib/utils/pendingNotification.js';

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

  // Navigations are intentionally NOT intercepted (#121). This is an SSR app
  // (adapter-node, no prerendered route HTML), so there is nothing useful to
  // fall back to: a network-first handler here hung with no timeout on cold
  // Cloud Run instances, and on a network error `caches.match(navigation)` was
  // always a miss -> respondWith(undefined) -> a broken page that only a hard
  // refresh recovered. Letting navigations go straight to the network gives the
  // browser's normal load behavior. The SW still precaches JS/CSS below and
  // handles push. (Cold-start latency itself is the separate #104 lever.)

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

  const rawUrl = event.notification.data?.url || '/';
  // Defense-in-depth (#83): only navigate within the app. The send endpoint
  // already normalizes the URL, but never trust the payload here either.
  // Resolve and compare origins instead of prefix checks — the URL parser
  // treats "\" as "/" and strips tabs/newlines, so "/\evil.com" would sneak
  // past startsWith('/').
  let url = '/';
  try {
    const parsed = new URL(rawUrl, sw.location.origin);
    if (parsed.origin === sw.location.origin) {
      // Hand the notification content to the page as query params so the
      // app can show it in an in-app popup (#130). The page strips these
      // with history.replaceState after displaying. NOTE: when the OS
      // launches a fully-closed PWA these params can be dropped, so the
      // content is ALSO parked in IndexedDB below — the popup component
      // falls back to it.
      parsed.searchParams.set('pn', '1');
      if (event.notification.title) {
        parsed.searchParams.set('pn_title', event.notification.title);
      }
      if (event.notification.body) {
        parsed.searchParams.set('pn_body', event.notification.body);
      }
      url = parsed.pathname + parsed.search + parsed.hash;
    }
  } catch {
    // Unparseable — fall back to '/'
  }

  event.waitUntil(
    // Park the content in IndexedDB first (cold-start fallback, #130): the
    // popup reads-and-deletes it when the URL params don't make it through.
    // An IDB failure must never block opening the app.
    savePendingNotification({
      title: event.notification.title || '',
      body: event.notification.body || '',
      ts: Date.now()
    })
      .catch(() => {})
      .then(() =>
        sw.clients.matchAll({ type: 'window', includeUncontrolled: true })
      )
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

// Handle expired subscriptions: renew the browser-side subscription so push
// keeps working. The service worker cannot authenticate to /api/push/subscribe
// (the Supabase session lives in localStorage, unreachable from a SW), so the
// old unauthenticated POST here always 401ed and the renewed subscription was
// silently lost. Persisting is now done by NotificationPermission.svelte on
// the next app load, which re-syncs whenever the endpoint changes (#74).
sw.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    (async () => {
      const options = event.oldSubscription?.options;
      if (!options) return; // nothing to renew from
      await sw.registration.pushManager.subscribe(options);
    })()
  );
});

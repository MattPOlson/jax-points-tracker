// Bounded retry wrapper for transient upstream failures (5xx + network errors).
//
// Motivation (#118): a one-off GoTrue -> Postgres timeout returned a 500 on
// `POST /auth/v1/token?grant_type=refresh_token`; the very next call succeeded.
// A single backoff retry makes that whole class of transient blip invisible to
// the user instead of surfacing as an auth error.
//
// Only *idempotent* requests are retried: GET/HEAD reads, and the Supabase auth
// token endpoint (login / refresh), which is safe to repeat. Writes to PostgREST
// (POST/PATCH/PUT/DELETE) are never auto-retried — retrying a write that already
// partially applied is unsafe, and RLS-denied writes return 0 rows without an
// error, so a repeat could mask or double an effect.

const MAX_RETRIES = 2; // total attempts = 3
const BASE_DELAY_MS = 200;
const MAX_DELAY_MS = 1500;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function isRetryable(url, method) {
  const m = (method || 'GET').toUpperCase();
  if (m === 'GET' || m === 'HEAD') return true;
  // Auth token grant/refresh is safe to retry.
  if (m === 'POST' && /\/auth\/v1\/token\b/.test(url)) return true;
  return false;
}

function backoffDelay(attempt) {
  const base = Math.min(BASE_DELAY_MS * 2 ** attempt, MAX_DELAY_MS);
  return base + Math.random() * base * 0.25; // +0-25% jitter
}

/**
 * Wraps a fetch implementation with retry-on-transient-failure. Pass the result
 * as the Supabase client's `global.fetch`.
 */
export function createRetryFetch(baseFetch = fetch) {
  return async function retryFetch(input, init = {}) {
    const url = typeof input === 'string' ? input : input.url;
    const method = init.method || (typeof input === 'object' ? input.method : 'GET');
    const retryable = isRetryable(url, method);

    for (let attempt = 0; ; attempt++) {
      try {
        const response = await baseFetch(input, init);
        // Retry only transient server errors, and only while attempts remain.
        if (retryable && response.status >= 500 && attempt < MAX_RETRIES) {
          await sleep(backoffDelay(attempt));
          continue;
        }
        return response;
      } catch (err) {
        // Network/abort failure — retry if idempotent and attempts remain,
        // otherwise propagate so the caller can handle it.
        if (retryable && attempt < MAX_RETRIES) {
          await sleep(backoffDelay(attempt));
          continue;
        }
        throw err;
      }
    }
  };
}

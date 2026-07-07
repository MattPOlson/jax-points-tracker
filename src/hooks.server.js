/**
 * Security headers for every response (#84).
 *
 * The Content-Security-Policy itself is configured in svelte.config.js
 * (kit.csp) so SvelteKit can nonce its inline startup script; everything
 * else lives here.
 */
export async function handle({ event, resolve }) {
  const response = await resolve(event);

  response.headers.set('X-Content-Type-Options', 'nosniff');
  // Legacy complement to the CSP frame-ancestors directive.
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // Cloud Run terminates TLS; the app is only ever served over HTTPS.
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  return response;
}

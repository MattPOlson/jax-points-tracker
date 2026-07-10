/**
 * Security headers for every response (#84) and a cheap 404 for
 * vulnerability-scanner probes (#102).
 *
 * The Content-Security-Policy itself is configured in svelte.config.js
 * (kit.csp) so SvelteKit can nonce its inline startup script; everything
 * else lives here.
 */

// Scanner probes for stacks this app doesn't run (WordPress/PHP, leaked
// dotfiles). Each one otherwise falls through to the catch-all route and
// renders a full ~7KB error page -- on a cold instance that's 1.5s of
// compute for a bot (#102). Answer with a tiny plain-text 404 instead.
// Keep patterns narrow: /.well-known/* must stay routable.
const SCANNER_PROBES = [
  /\.php$/i, // no PHP endpoints exist (xmlrpc.php, index.php?opt=...)
  /^\/wp-/i, // wp-admin, wp-login, wp-content, ...
  /^\/wordpress\b/i,
  /^\/\.env/i, // /.env, /.env.bak, ...
  /^\/\.git\b/i,
  /^\/phpmyadmin/i
];

export async function handle({ event, resolve }) {
  const { pathname } = event.url;
  if (SCANNER_PROBES.some((probe) => probe.test(pathname))) {
    return new Response('Not Found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain', 'X-Content-Type-Options': 'nosniff' }
    });
  }

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

/**
 * Last-resort handler for uncaught errors during SSR (#118). SvelteKit renders
 * src/routes/+error.svelte with the shape returned here, so the user gets the
 * branded "something went wrong" page instead of a raw 500. The real error is
 * logged server-side; only a safe, generic message is exposed to the client.
 */
export function handleError({ error, event }) {
  console.error(`[SSR error] ${event?.url?.pathname ?? ''}`, error);
  return {
    message: 'An unexpected error occurred. Please try again.'
  };
}

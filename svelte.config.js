import adapter from '@sveltejs/adapter-node';

export default {
  kit: {
    adapter: adapter(),

    // Content-Security-Policy (#84). SvelteKit injects nonces for its own
    // inline startup script in 'auto' mode. Notes on the allowances:
    // - style-src 'unsafe-inline': Svelte applies transition/animation styles
    //   via inline style attributes, which nonces cannot cover.
    // - fonts.googleapis.com / fonts.gstatic.com: the DM Sans + Oswald fonts
    //   loaded from app.html.
    // - *.supabase.co: auth + PostgREST (https) and realtime (wss).
    csp: {
      mode: 'auto',
      directives: {
        'default-src': ['self'],
        'script-src': ['self'],
        'style-src': ['self', 'unsafe-inline', 'https://fonts.googleapis.com'],
        'font-src': ['self', 'data:', 'https://fonts.gstatic.com'],
        'img-src': ['self', 'data:', 'blob:'],
        'connect-src': ['self', 'https://*.supabase.co', 'wss://*.supabase.co'],
        'worker-src': ['self'],
        'manifest-src': ['self'],
        'object-src': ['none'],
        'base-uri': ['self'],
        'frame-ancestors': ['none'],
        'form-action': ['self']
      }
    }
  }
};

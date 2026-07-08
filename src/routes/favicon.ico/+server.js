import { read } from '$app/server';
import favicon from '$lib/assets/favicon.ico';

// Served as a route rather than from static/ because sirv's mime table
// doesn't know .ico and would send an empty Content-Type (#101).
export const GET = () => {
  return new Response(read(favicon).body, {
    headers: {
      'Content-Type': 'image/x-icon',
      'Cache-Control': 'public, max-age=86400'
    }
  });
};

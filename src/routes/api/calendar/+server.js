import { json, error } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';

// =============================================
// Read-only sync of the club Google Calendar.
// Google Calendar is the source of truth; this endpoint only reads.
// The API key is held server-side and never exposed to the browser.
// =============================================

// Simple in-memory cache (adapter-node persists across requests) to avoid
// hammering the Google Calendar API and to stay within quota.
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
/** @type {{ data: any[]; expires: number } | null} */
let cache = null;

const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3/calendars';

/** Normalize a Google Calendar event into the shape the UI expects. */
function normalizeEvent(ev) {
  const isAllDay = Boolean(ev.start?.date && !ev.start?.dateTime);
  const start = ev.start?.dateTime || ev.start?.date || null;
  const end = ev.end?.dateTime || ev.end?.date || null;

  return {
    id: ev.id,
    title: ev.summary || '(No title)',
    start,
    end,
    allDay: isAllDay,
    location: ev.location || null,
    description: ev.description || null,
    htmlLink: ev.htmlLink || null
  };
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ request }) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw error(500, 'Server misconfigured: missing Supabase env vars');
  }
  if (!calendarId || !apiKey) {
    throw error(
      500,
      'Calendar not configured: missing GOOGLE_CALENDAR_ID or GOOGLE_CALENDAR_API_KEY'
    );
  }

  // Verify the requesting user is signed in (the calendar button is for
  // logged-in members), consistent with the other authenticated endpoints.
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw error(401, 'Unauthorized');
  }
  const token = authHeader.slice(7);

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
  const {
    data: { user },
    error: authError
  } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    throw error(401, 'Invalid token');
  }

  // Serve from cache when fresh.
  const now = Date.now();
  if (cache && cache.expires > now) {
    return json({ events: cache.data, cached: true });
  }

  // Pull upcoming events for roughly the next 6 months.
  const timeMin = new Date(now).toISOString();
  const timeMax = new Date(now + 183 * 24 * 60 * 60 * 1000).toISOString();

  const params = new URLSearchParams({
    key: apiKey,
    singleEvents: 'true', // expand recurring events into individual instances
    orderBy: 'startTime',
    timeMin,
    timeMax,
    maxResults: '250'
  });

  const url = `${GOOGLE_CALENDAR_API}/${encodeURIComponent(calendarId)}/events?${params}`;

  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    console.error('Failed to reach Google Calendar API:', err);
    throw error(502, 'Could not reach Google Calendar');
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error('Google Calendar API error', res.status, detail);
    if (res.status === 404) {
      throw error(502, 'Calendar not found — check GOOGLE_CALENDAR_ID and that it is public');
    }
    if (res.status === 403) {
      throw error(502, 'Calendar access denied — check the API key and that the calendar is public');
    }
    throw error(502, 'Google Calendar request failed');
  }

  const payload = await res.json();
  const events = (payload.items || [])
    .filter((ev) => ev.status !== 'cancelled' && (ev.start?.dateTime || ev.start?.date))
    .map(normalizeEvent);

  cache = { data: events, expires: now + CACHE_TTL_MS };

  return json({ events, cached: false });
}

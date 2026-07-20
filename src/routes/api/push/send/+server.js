import { json, error } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  // Cloud Run injects SUPABASE_URL; VITE_SUPABASE_URL is builder-stage only (#127).
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const vapidPublicKey = process.env.VITE_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@jaxale.com';

  if (!supabaseUrl || !serviceRoleKey || !vapidPublicKey || !vapidPrivateKey) {
    throw error(500, 'Server misconfigured: missing VAPID or Supabase env vars');
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  // Verify the requesting user is an officer
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw error(401, 'Unauthorized');
  }
  const token = authHeader.slice(7);

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    throw error(401, 'Invalid token');
  }

  const { data: member, error: memberError } = await supabaseAdmin
    .from('members')
    .select('is_officer')
    .eq('id', user.id)
    .single();

  if (memberError || !member?.is_officer) {
    throw error(403, 'Officer privileges required');
  }

  const body = await request.json();
  const { title, message, url, audience } = body;

  if (!title?.trim() || !message?.trim()) {
    throw error(400, 'Title and message are required');
  }

  // ---- Audience targeting (#134) ---------------------------------------
  // The recipient set is computed server-side; a crafted request may only
  // choose *which* members to target, never the endpoints themselves. Shape:
  //   { type: 'all' | 'officers' | 'members', memberIds?: uuid[] }
  // Absent/`all` preserves the original broadcast-to-everyone behavior.
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const MAX_TARGETED_MEMBERS = 50;

  const audienceType = audience?.type ?? 'all';
  if (!['all', 'officers', 'members'].includes(audienceType)) {
    throw error(400, 'Invalid audience type');
  }

  let targetMemberIds = null; // null = no member_id filter (all subscriptions)

  if (audienceType === 'officers') {
    const { data: officers, error: officerError } = await supabaseAdmin
      .from('members')
      .select('id')
      .eq('is_officer', true);
    if (officerError) {
      throw error(500, 'Failed to resolve officer audience');
    }
    targetMemberIds = (officers ?? []).map((m) => m.id);
  } else if (audienceType === 'members') {
    const ids = audience?.memberIds;
    if (!Array.isArray(ids) || ids.length === 0) {
      throw error(400, 'memberIds must be a non-empty array for a targeted send');
    }
    if (ids.length > MAX_TARGETED_MEMBERS) {
      throw error(400, `Cannot target more than ${MAX_TARGETED_MEMBERS} members at once`);
    }
    if (!ids.every((id) => typeof id === 'string' && UUID_RE.test(id))) {
      throw error(400, 'memberIds must all be valid UUIDs');
    }
    targetMemberIds = ids;
  }

  // Server-side caps mirroring the client form limits — the client's
  // maxlength attributes are advisory only (#83).
  if (title.trim().length > 100 || message.trim().length > 200) {
    throw error(400, 'Title is limited to 100 characters and message to 200');
  }

  // Only same-origin relative paths may ride in a notification: a push from
  // the club app carries implicit trust, so a URL resolving off-origin would
  // make it a phishing amplifier (#83). Resolve against a sentinel origin
  // rather than string-prefix checks — the URL parser treats "\" as "/" and
  // strips tabs/newlines, so "/\evil.com" would sneak past startsWith('/').
  // The service worker enforces the same rule when the notification is clicked.
  let safeUrl = '/';
  if (typeof url === 'string') {
    try {
      const sentinel = 'https://sentinel.invalid';
      const parsed = new URL(url, sentinel);
      if (parsed.origin === sentinel) {
        safeUrl = parsed.pathname + parsed.search + parsed.hash;
      }
    } catch {
      // Unparseable — fall back to '/'
    }
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  // Fetch subscriptions for the resolved audience. An empty targetMemberIds
  // (e.g. officers-only with no officers subscribed, or a valid but
  // unsubscribed member list) means nobody to reach — short-circuit rather
  // than issuing an `.in(..., [])` that matches everything on some drivers.
  if (targetMemberIds !== null && targetMemberIds.length === 0) {
    return json({ ok: true, sent: 0, failed: 0, message: 'No subscribers in audience' });
  }

  let query = supabaseAdmin.from('push_subscriptions').select('id, endpoint, subscription');
  if (targetMemberIds !== null) {
    query = query.in('member_id', targetMemberIds);
  }
  const { data: subscriptions, error: fetchError } = await query;

  if (fetchError) {
    throw error(500, 'Failed to fetch subscriptions');
  }

  if (!subscriptions?.length) {
    return json({ ok: true, sent: 0, message: 'No subscribers' });
  }

  const payload = JSON.stringify({
    title: title.trim(),
    body: message.trim(),
    url: safeUrl
  });

  const results = await Promise.allSettled(
    subscriptions.map((row) =>
      webpush.sendNotification(row.subscription, payload).catch(async (err) => {
        // Remove expired/invalid subscriptions (HTTP 410 Gone)
        if (err.statusCode === 410 || err.statusCode === 404) {
          await supabaseAdmin.from('push_subscriptions').delete().eq('id', row.id);
        }
        throw err;
      })
    )
  );

  const sent = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.length - sent;

  return json({ ok: true, sent, failed });
}

import { json, error } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
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
  const { title, message, url } = body;

  if (!title?.trim() || !message?.trim()) {
    throw error(400, 'Title and message are required');
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  // Fetch all subscriptions
  const { data: subscriptions, error: fetchError } = await supabaseAdmin
    .from('push_subscriptions')
    .select('id, endpoint, subscription');

  if (fetchError) {
    throw error(500, 'Failed to fetch subscriptions');
  }

  if (!subscriptions?.length) {
    return json({ ok: true, sent: 0, message: 'No subscribers' });
  }

  const payload = JSON.stringify({
    title: title.trim(),
    body: message.trim(),
    url: url || '/'
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

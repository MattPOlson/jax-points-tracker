import { json, error } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw error(500, 'Server misconfigured');
  }

  const body = await request.json();
  const { subscription, memberId } = body;

  if (!subscription?.endpoint || !memberId) {
    throw error(400, 'Missing subscription or memberId');
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  // Upsert: if same endpoint already exists, update it; otherwise insert
  const { error: dbError } = await supabaseAdmin
    .from('push_subscriptions')
    .upsert(
      {
        member_id: memberId,
        endpoint: subscription.endpoint,
        subscription
      },
      { onConflict: 'endpoint' }
    );

  if (dbError) {
    console.error('Error saving push subscription:', dbError);
    throw error(500, 'Failed to save subscription');
  }

  return json({ ok: true });
}

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ request }) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw error(500, 'Server misconfigured');
  }

  const body = await request.json();
  const { endpoint } = body;

  if (!endpoint) {
    throw error(400, 'Missing endpoint');
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  const { error: dbError } = await supabaseAdmin
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', endpoint);

  if (dbError) {
    console.error('Error removing push subscription:', dbError);
    throw error(500, 'Failed to remove subscription');
  }

  return json({ ok: true });
}

import { json, error } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw error(500, 'Server misconfigured');
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  // Verify the requesting user is authenticated
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw error(401, 'Unauthorized');
  }
  const token = authHeader.slice(7);

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    throw error(401, 'Invalid token');
  }

  const body = await request.json();
  const { subscription } = body;

  if (!subscription?.endpoint) {
    throw error(400, 'Missing subscription');
  }

  // Always use the authenticated user's ID — never trust memberId from the request body
  const { error: dbError } = await supabaseAdmin
    .from('push_subscriptions')
    .upsert(
      {
        member_id: user.id,
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

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  // Verify the requesting user is authenticated
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw error(401, 'Unauthorized');
  }
  const token = authHeader.slice(7);

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    throw error(401, 'Invalid token');
  }

  const body = await request.json();
  const { endpoint } = body;

  if (!endpoint) {
    throw error(400, 'Missing endpoint');
  }

  // Scope deletion to the authenticated user's subscriptions only
  const { error: dbError } = await supabaseAdmin
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', endpoint)
    .eq('member_id', user.id);

  if (dbError) {
    console.error('Error removing push subscription:', dbError);
    throw error(500, 'Failed to remove subscription');
  }

  return json({ ok: true });
}

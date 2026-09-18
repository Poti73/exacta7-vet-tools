import Stripe from 'stripe';
import { createAdminClient } from '../../../../lib/supabase/admin';
import { createClient } from '../../../../lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();
    const userId = typeof data?.claims?.sub === 'string' ? data.claims.sub : null;
    if (error || !userId) return Response.json({ error: 'authentication_required' }, { status: 401 });
    const admin = createAdminClient();
    const { data: profile } = await admin.from('profiles').select('stripe_customer_id').eq('id', userId).maybeSingle();
    if (!profile?.stripe_customer_id) return Response.json({ error: 'billing_profile_missing' }, { status: 404 });
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return Response.json({ error: 'billing_not_configured' }, { status: 503 });
    const origin = process.env.NODE_ENV === 'production' ? 'https://exacta7.com' : new URL(request.url).origin;
    const session = await new Stripe(key).billingPortal.sessions.create({ customer: profile.stripe_customer_id, return_url: `${origin}/cuenta` });
    return Response.json({ url: session.url });
  } catch (error) {
    console.error('[billing] Portal failed', error instanceof Error ? error.message : 'unknown_error');
    return Response.json({ error: 'portal_unavailable' }, { status: 503 });
  }
}

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
    const { interval } = await request.json() as { interval?: string };
    const price = interval === 'yearly' ? process.env.STRIPE_PRO_YEARLY_PRICE_ID : interval === 'monthly' ? process.env.STRIPE_PRO_MONTHLY_PRICE_ID : null;
    if (!price) return Response.json({ error: 'invalid_plan' }, { status: 400 });
    const admin = createAdminClient();
    const { data: profile } = await admin.from('profiles').select('stripe_customer_id').eq('id', userId).maybeSingle();
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return Response.json({ error: 'billing_not_configured' }, { status: 503 });
    const stripe = new Stripe(key);
    let customerId = profile?.stripe_customer_id ?? null;
    if (!customerId) {
      const email = typeof data?.claims?.email === 'string' ? data.claims.email : undefined;
      const customer = await stripe.customers.create({ email, metadata: { supabase_user_id: userId } });
      customerId = customer.id;
      await admin.from('profiles').upsert({ id: userId, stripe_customer_id: customerId }, { onConflict: 'id' });
    }
    const origin = process.env.NODE_ENV === 'production' ? 'https://exacta7.com' : new URL(request.url).origin;
    const session = await stripe.checkout.sessions.create({ mode: 'subscription', customer: customerId, client_reference_id: userId, line_items: [{ price, quantity: 1 }], metadata: { supabase_user_id: userId }, subscription_data: { metadata: { supabase_user_id: userId } }, allow_promotion_codes: true, billing_address_collection: 'auto', success_url: `${origin}/cuenta?checkout=success`, cancel_url: `${origin}/planes?checkout=cancel` });
    if (!session.url) throw new Error('Stripe no devolvió una URL de Checkout.');
    return Response.json({ url: session.url });
  } catch (error) {
    console.error('[billing] Checkout failed', error instanceof Error ? error.message : 'unknown_error');
    return Response.json({ error: 'checkout_unavailable' }, { status: 503 });
  }
}

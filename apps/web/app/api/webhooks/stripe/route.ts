import Stripe from 'stripe';
import { createAdminClient } from '../../../../lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function customerId(value: string | Stripe.Customer | Stripe.DeletedCustomer | null) {
  return typeof value === 'string' ? value : value?.id ?? null;
}

export async function POST(request: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get('stripe-signature');
  if (!key || !secret) return Response.json({ error: 'webhook_not_configured' }, { status: 503 });
  if (!signature) return Response.json({ error: 'missing_signature' }, { status: 400 });
  const stripe = new Stripe(key);
  let event: Stripe.Event;
  try { event = stripe.webhooks.constructEvent(await request.text(), signature, secret); }
  catch { return Response.json({ error: 'invalid_signature' }, { status: 400 }); }

  const admin = createAdminClient();
  const { data: existing } = await admin.from('billing_events').select('processed_at').eq('stripe_event_id', event.id).maybeSingle();
  if (existing?.processed_at) return Response.json({ received: true, duplicate: true });
  if (!existing) {
    const { error } = await admin.from('billing_events').insert({ stripe_event_id: event.id, event_type: event.type });
    if (error && error.code !== '23505') return Response.json({ error: 'event_log_failed' }, { status: 500 });
  }
  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
      if (subscriptionId) await syncSubscription(admin, await stripe.subscriptions.retrieve(subscriptionId), session.client_reference_id ?? session.metadata?.supabase_user_id ?? null);
    }
    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') await syncSubscription(admin, event.data.object as Stripe.Subscription, null);
    await admin.from('billing_events').update({ processed_at: new Date().toISOString(), error_message: null }).eq('stripe_event_id', event.id);
    return Response.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 500) : 'unknown_error';
    await admin.from('billing_events').update({ error_message: message }).eq('stripe_event_id', event.id);
    return Response.json({ error: 'webhook_processing_failed' }, { status: 500 });
  }
}

async function syncSubscription(admin: ReturnType<typeof createAdminClient>, subscription: Stripe.Subscription, explicitUserId: string | null) {
  const stripeCustomerId = customerId(subscription.customer);
  let userId = explicitUserId ?? subscription.metadata.supabase_user_id ?? null;
  if (!userId && stripeCustomerId) {
    const { data } = await admin.from('profiles').select('id').eq('stripe_customer_id', stripeCustomerId).maybeSingle();
    userId = data?.id ?? null;
  }
  if (!userId || !stripeCustomerId) throw new Error('No se pudo asociar la suscripción a un usuario.');
  const priceId = subscription.items.data[0]?.price.id ?? null;
  const { error: profileError } = await admin.from('profiles').upsert({ id: userId, stripe_customer_id: stripeCustomerId }, { onConflict: 'id' });
  if (profileError) throw profileError;
  const periodEnd = subscription.items.data[0]?.current_period_end;
  const { error: subscriptionError } = await admin.from('subscriptions').upsert({ user_id: userId, stripe_customer_id: stripeCustomerId, stripe_subscription_id: subscription.id, stripe_price_id: priceId, status: subscription.status, current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null, cancel_at_period_end: subscription.cancel_at_period_end, updated_at: new Date().toISOString() }, { onConflict: 'stripe_subscription_id' });
  if (subscriptionError) throw subscriptionError;
}

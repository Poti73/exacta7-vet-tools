import Stripe from 'stripe';
import { createAdminClient } from '../../../../lib/supabase/admin';
import { isCustomerType } from '../../../../lib/billing';

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

  let admin: ReturnType<typeof createAdminClient> | undefined;
  try {
    admin = createAdminClient();
    const { data: existing, error: lookupError } = await admin.from('billing_events').select('processed_at').eq('stripe_event_id', event.id).maybeSingle();
    if (lookupError) throw lookupError;
    if (existing?.processed_at) return Response.json({ received: true, duplicate: true });
    if (!existing) {
      const { error } = await admin.from('billing_events').insert({ stripe_event_id: event.id, event_type: event.type });
      if (error && error.code !== '23505') throw error;
    }
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const session = event.data.object as Stripe.Checkout.Session;
      const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
      if (subscriptionId) await syncSubscription(admin, await stripe.subscriptions.retrieve(subscriptionId), session.client_reference_id ?? session.metadata?.supabase_user_id ?? null);
      const stripeCustomerId = customerId(session.customer);
      if (session.mode === 'subscription' && stripeCustomerId && session.status === 'complete'
        && (session.payment_status === 'paid' || session.payment_status === 'no_payment_required')
        && isCustomerType(session.metadata?.customer_type)) {
        // Checkout itself saves address/name/tax IDs to Stripe. Only mirror the
        // declared buyer type locally; never copy customer_details or tax values.
        const current = await stripe.customers.retrieve(stripeCustomerId);
        if (!current.deleted) {
          const previousCheckout = Number(current.metadata.exacta7_checkout_created ?? 0);
          if (session.created >= previousCheckout) {
            await stripe.customers.update(stripeCustomerId, {
              metadata: { customer_type: session.metadata.customer_type, exacta7_checkout_created: String(session.created) },
            });
            const { error: profileError } = await admin.from('profiles').update({
              customer_type: session.metadata.customer_type,
              updated_at: new Date().toISOString(),
            }).eq('stripe_customer_id', stripeCustomerId);
            if (profileError) throw profileError;
          }
        }
      }
    }
    // Customer changes remain authoritative in Stripe for address/name/tax IDs.
    // customer.updated must never classify a buyer from manually edited metadata.
    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      // Read current state instead of letting a delayed snapshot restore Pro.
      await syncSubscription(admin, await stripe.subscriptions.retrieve((event.data.object as Stripe.Subscription).id), null);
    }
    if (event.type === 'invoice.paid' || event.type === 'invoice.payment_failed') {
      // Older webhook API versions expose invoice.subscription directly.
      const invoice = event.data.object as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null };
      const subscription = invoice.parent?.subscription_details?.subscription ?? invoice.subscription;
      const subscriptionId = typeof subscription === 'string' ? subscription : subscription?.id;
      if (subscriptionId) await syncSubscription(admin, await stripe.subscriptions.retrieve(subscriptionId), null);
    }
    const { error: processedError } = await admin.from('billing_events').update({ processed_at: new Date().toISOString(), error_message: null }).eq('stripe_event_id', event.id);
    if (processedError) throw processedError;
    return Response.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 500) : 'unknown_error';
    if (admin) await admin.from('billing_events').update({ error_message: message }).eq('stripe_event_id', event.id);
    return Response.json({ error: 'webhook_processing_failed' }, { status: 500 });
  }
}

async function syncSubscription(admin: ReturnType<typeof createAdminClient>, subscription: Stripe.Subscription, explicitUserId: string | null) {
  const stripeCustomerId = customerId(subscription.customer);
  let userId = explicitUserId ?? subscription.metadata.supabase_user_id ?? null;
  if (!userId && stripeCustomerId) {
    const { data, error } = await admin.from('profiles').select('id').eq('stripe_customer_id', stripeCustomerId).maybeSingle();
    if (error) throw error;
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

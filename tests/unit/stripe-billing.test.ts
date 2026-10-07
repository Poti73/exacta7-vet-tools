import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  auth: vi.fn(), from: vi.fn(), createCustomer: vi.fn(), retrieveCustomer: vi.fn(),
  updateCustomer: vi.fn(), createSession: vi.fn(), retrieveSubscription: vi.fn(), verify: vi.fn(),
}));
vi.mock('../../apps/web/lib/supabase/server', () => ({ createClient: async () => ({ auth: { getClaims: mocks.auth } }) }));
vi.mock('../../apps/web/lib/supabase/admin', () => ({ createAdminClient: () => ({ from: mocks.from }) }));
// Resolve the app's SDK installation, which can differ from the root dependency
// path in this pnpm workspace. No Stripe request should leave the test process.
vi.mock('../../apps/web/node_modules/stripe/esm/stripe.esm.node.js', () => ({ default: class {
  customers = { create: mocks.createCustomer, retrieve: mocks.retrieveCustomer, update: mocks.updateCustomer };
  checkout = { sessions: { create: mocks.createSession } };
  subscriptions = { retrieve: mocks.retrieveSubscription };
  webhooks = { constructEvent: mocks.verify };
} }));

import { POST as checkout } from '../../apps/web/app/api/billing/checkout/route';
import { POST as webhook } from '../../apps/web/app/api/webhooks/stripe/route';

type Row = Record<string, unknown>;
const writes: { table: string; value: Row }[] = [];
let profile: Row | null;
let processed: string | null;
let failedTable: string | null;
let failProcessed: boolean;

function query(table: string) {
  let value: Row = {};
  let updating = false;
  const result = () => ({ data: null, error: table === failedTable || (failProcessed && 'processed_at' in value) ? { message: 'database unavailable' } : null });
  const chain = {
    select: () => chain,
    eq: () => chain,
    maybeSingle: async () => ({ data: table === 'profiles' ? profile : processed ? { processed_at: processed } : null, error: null }),
    insert: async (row: Row) => { writes.push({ table, value: row }); return result(); },
    upsert: async (row: Row) => { writes.push({ table, value: row }); return result(); },
    update: (row: Row) => { value = row; updating = true; return chain; },
    then: (resolve: (value: ReturnType<typeof result>) => unknown) => {
      if (updating) writes.push({ table, value });
      return Promise.resolve(result()).then(resolve);
    },
  };
  return chain;
}

function request(body: unknown) {
  return new Request('http://localhost/api/billing/checkout', { method: 'POST', body: JSON.stringify(body) });
}
async function sendEvent(type: string, object: Row) {
  if (type === 'checkout.session.completed' || type === 'checkout.session.async_payment_succeeded') {
    object = { status: 'complete', payment_status: 'paid', ...object };
  }
  mocks.verify.mockReturnValue({ id: 'evt_test', type, data: { object } });
  return webhook(new Request('http://localhost/api/webhooks/stripe', { method: 'POST', headers: { 'stripe-signature': 'signed' }, body: 'raw event' }));
}
const subscription = { id: 'sub_test', customer: 'cus_test', metadata: { supabase_user_id: 'user_test' }, items: { data: [{ price: { id: 'price_month' }, current_period_end: 1800000000 }] }, status: 'active', cancel_at_period_end: false };

beforeEach(() => {
  vi.resetAllMocks();
  writes.length = 0;
  profile = { id: 'user_test', stripe_customer_id: 'cus_test', customer_type: null };
  processed = null;
  failedTable = null;
  failProcessed = false;
  vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_mock');
  vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_mock');
  vi.stubEnv('STRIPE_PRO_MONTHLY_PRICE_ID', 'price_month');
  vi.stubEnv('STRIPE_PRO_YEARLY_PRICE_ID', 'price_year');
  mocks.auth.mockResolvedValue({ data: { claims: { sub: 'user_test', email: 'user@example.com' } }, error: null });
  mocks.from.mockImplementation(query);
  mocks.createCustomer.mockResolvedValue({ id: 'cus_new' });
  mocks.retrieveCustomer.mockResolvedValue({ id: 'cus_test', metadata: {}, business_name: null, tax_ids: { data: [] } });
  mocks.updateCustomer.mockImplementation(async (_id: string, params: { metadata: Row }) => {
    const customer = { id: 'cus_test', metadata: params.metadata };
    mocks.retrieveCustomer.mockResolvedValue(customer);
    return customer;
  });
  mocks.createSession.mockResolvedValue({ url: 'https://checkout.stripe.com/test' });
  mocks.retrieveSubscription.mockResolvedValue(subscription);
});

describe('Stripe Checkout billing identity', () => {
  it('reuses the Customer, keeps prices and collects B2B details on Stripe', async () => {
    const response = await checkout(request({ interval: 'yearly', customer_type: 'business' }));
    expect(response.status).toBe(200);
    expect(mocks.createCustomer).not.toHaveBeenCalled();
    const params = mocks.createSession.mock.calls[0][0];
    expect(params).toMatchObject({ customer: 'cus_test', mode: 'subscription', line_items: [{ price: 'price_year', quantity: 1 }], billing_address_collection: 'required', customer_update: { address: 'auto', name: 'auto' }, tax_id_collection: { enabled: true }, name_collection: { business: { enabled: true, optional: false } }, metadata: { supabase_user_id: 'user_test', customer_type: 'business' } });
    expect(params).not.toHaveProperty('automatic_tax');
    expect(params).not.toHaveProperty('customer_creation');
    // An abandoned session must not change the saved buyer type.
    expect(mocks.updateCustomer).not.toHaveBeenCalled();
    expect(writes).toEqual([]);
  });

  it('creates and saves a new Customer before starting B2C Checkout', async () => {
    profile = null;
    expect((await checkout(request({ interval: 'monthly', customer_type: 'individual' }))).status).toBe(200);
    expect(mocks.createCustomer).toHaveBeenCalledWith({ email: 'user@example.com', metadata: { supabase_user_id: 'user_test' } }, { idempotencyKey: 'exacta7-customer-user_test' });
    expect(writes).toContainEqual({ table: 'profiles', value: { id: 'user_test', stripe_customer_id: 'cus_new' } });
    expect(mocks.createSession.mock.calls[0][0]).toMatchObject({ customer: 'cus_new', tax_id_collection: { enabled: false }, name_collection: { individual: { enabled: true, optional: false } } });
  });

  it.each([undefined, 'business-ish', null, { country: 'ES' }])('rejects invalid buyer type %j before writing', async customer_type => {
    expect((await checkout(request({ interval: 'monthly', customer_type }))).status).toBe(400);
    expect(mocks.createSession).not.toHaveBeenCalled();
    expect(writes).toEqual([]);
  });

  it('requires authentication', async () => {
    mocks.auth.mockResolvedValue({ data: null, error: {} });
    expect((await checkout(request({ interval: 'monthly', customer_type: 'business' }))).status).toBe(401);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it.each([{ business_name: 'Clinic' }, { tax_ids: { data: [{ id: 'txi_existing' }] } }])('blocks B2C reuse with retained business details %j', async details => {
    mocks.retrieveCustomer.mockResolvedValue({ id: 'cus_test', metadata: {}, ...details });
    const response = await checkout(request({ interval: 'monthly', customer_type: 'individual' }));
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: 'billing_identity_conflict' });
    expect(mocks.createSession).not.toHaveBeenCalled();
    expect(mocks.updateCustomer).not.toHaveBeenCalled();
  });

  it('does not start Checkout if saving the Customer ID fails', async () => {
    profile = null;
    failedTable = 'profiles';
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect((await checkout(request({ interval: 'monthly', customer_type: 'business' }))).status).toBe(503);
    expect(mocks.createSession).not.toHaveBeenCalled();
    log.mockRestore();
  });
});

describe('verified Stripe billing webhooks', () => {
  it('persists only type and references after completed Checkout, without copying fiscal data', async () => {
    const response = await sendEvent('checkout.session.completed', { mode: 'subscription', created: 100, customer: 'cus_test', subscription: 'sub_test', client_reference_id: 'user_test', metadata: { customer_type: 'business' }, customer_details: { address: { country: 'ES', postal_code: '35200', city: 'Telde', state: 'Las Palmas', line1: 'Test address' }, tax_ids: [{ value: 'private tax value' }] } });
    expect(response.status).toBe(200);
    expect(mocks.updateCustomer).toHaveBeenCalledWith('cus_test', { metadata: { customer_type: 'business', exacta7_checkout_created: '100' } });
    expect(writes).toContainEqual({ table: 'profiles', value: { customer_type: 'business', updated_at: expect.any(String) } });
    expect(JSON.stringify(writes)).not.toMatch(/35200|Telde|private tax value|line1/);
  });

  it('does not classify legacy Checkout without declared type', async () => {
    expect((await sendEvent('checkout.session.completed', { mode: 'subscription', created: 100, customer: 'cus_test', subscription: 'sub_test', metadata: {} })).status).toBe(200);
    expect(mocks.updateCustomer).not.toHaveBeenCalled();
    expect(writes.filter(write => write.table === 'profiles').every(write => !('customer_type' in write.value))).toBe(true);
  });

  it('does not let an older completed Checkout overwrite a newer buyer type', async () => {
    mocks.retrieveCustomer.mockResolvedValue({ id: 'cus_test', metadata: { customer_type: 'individual', exacta7_checkout_created: '200' } });
    await sendEvent('checkout.session.completed', { mode: 'subscription', created: 100, customer: 'cus_test', subscription: 'sub_test', metadata: { customer_type: 'business' } });
    expect(mocks.updateCustomer).not.toHaveBeenCalled();
    expect(writes.filter(write => write.table === 'profiles').every(write => !('customer_type' in write.value))).toBe(true);
  });

  it('does not classify a NULL profile from customer.updated metadata', async () => {
    mocks.retrieveCustomer.mockResolvedValue({ id: 'cus_test', metadata: { customer_type: 'individual' } });
    expect((await sendEvent('customer.updated', { id: 'cus_test', metadata: { customer_type: 'business' } })).status).toBe(200);
    expect(writes.filter(write => write.table === 'profiles')).toEqual([]);
    expect(mocks.retrieveCustomer).not.toHaveBeenCalled();
  });

  it.each(['customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted', 'invoice.paid', 'invoice.payment_failed'])('syncs current subscription status on %s', async type => {
    mocks.retrieveSubscription.mockResolvedValue({ ...subscription, status: 'canceled' });
    const object = type.startsWith('invoice.') ? { parent: { subscription_details: { subscription: 'sub_test' } } } : subscription;
    expect((await sendEvent(type, object)).status).toBe(200);
    expect(writes).toContainEqual({ table: 'subscriptions', value: expect.objectContaining({ stripe_subscription_id: 'sub_test', status: 'canceled' }) });
  });

  it('ignores paid one-off invoices without changing subscription access', async () => {
    expect((await sendEvent('invoice.paid', { parent: null })).status).toBe(200);
    expect(mocks.retrieveSubscription).not.toHaveBeenCalled();
  });

  it('supports invoice events from older webhook API versions', async () => {
    expect((await sendEvent('invoice.paid', { subscription: 'sub_test' })).status).toBe(200);
    expect(mocks.retrieveSubscription).toHaveBeenCalledWith('sub_test');
  });

  it('retries completed Checkout when saving the buyer type fails', async () => {
    failedTable = 'profiles';
    expect((await sendEvent('checkout.session.completed', { mode: 'subscription', created: 100, customer: 'cus_test', metadata: { customer_type: 'business' } })).status).toBe(500);
    expect(writes.some(write => 'processed_at' in write.value)).toBe(false);
  });

  it.each([
    { status: 'open', payment_status: 'paid' },
    { status: 'expired', payment_status: 'paid' },
    { status: 'complete', payment_status: 'unpaid' },
  ])('does not save a buyer type before successful completion %j', async state => {
    expect((await sendEvent('checkout.session.completed', { mode: 'subscription', created: 100, customer: 'cus_test', metadata: { customer_type: 'business' }, ...state })).status).toBe(200);
    expect(writes.filter(write => write.table === 'profiles')).toEqual([]);
    expect(mocks.updateCustomer).not.toHaveBeenCalled();
  });

  it.each(['business', 'individual'])('classifies a NULL profile as %s after a paid Checkout', async customer_type => {
    expect((await sendEvent('checkout.session.completed', { mode: 'subscription', created: 100, customer: 'cus_test', metadata: { customer_type } })).status).toBe(200);
    expect(writes).toContainEqual({ table: 'profiles', value: { customer_type, updated_at: expect.any(String) } });
  });

  it.each([null, 'company', '', 'BUSINESS'])('never saves invalid Session metadata type %j', async customer_type => {
    expect((await sendEvent('checkout.session.completed', { mode: 'subscription', created: 100, customer: 'cus_test', metadata: { customer_type } })).status).toBe(200);
    expect(writes.filter(write => write.table === 'profiles')).toEqual([]);
    expect(mocks.updateCustomer).not.toHaveBeenCalled();
  });

  it('supports a completed Checkout with no payment required', async () => {
    expect((await sendEvent('checkout.session.completed', { mode: 'subscription', created: 100, payment_status: 'no_payment_required', customer: 'cus_test', metadata: { customer_type: 'business' } })).status).toBe(200);
    expect(writes).toContainEqual({ table: 'profiles', value: { customer_type: 'business', updated_at: expect.any(String) } });
  });

  it('waits for a deferred payment to succeed before saving the buyer type', async () => {
    const session = { mode: 'subscription', created: 100, customer: 'cus_test', metadata: { customer_type: 'business' } };
    await sendEvent('checkout.session.completed', { ...session, payment_status: 'unpaid' });
    expect(writes.filter(write => write.table === 'profiles')).toEqual([]);
    expect((await sendEvent('checkout.session.async_payment_succeeded', session)).status).toBe(200);
    expect(writes).toContainEqual({ table: 'profiles', value: { customer_type: 'business', updated_at: expect.any(String) } });
  });

  it('acknowledges an already processed event without reapplying writes', async () => {
    processed = '2026-10-07T00:00:00Z';
    const response = await sendEvent('customer.subscription.updated', subscription);
    expect(await response.json()).toEqual({ received: true, duplicate: true });
    expect(writes).toEqual([]);
  });

  it.each(['profiles', 'subscriptions'])('returns a retryable failure for %s write errors', async table => {
    failedTable = table;
    expect((await sendEvent('customer.subscription.updated', subscription)).status).toBe(500);
    expect(writes.some(write => 'processed_at' in write.value)).toBe(false);
  });

  it('returns 500 when marking an event processed fails', async () => {
    failProcessed = true;
    expect((await sendEvent('customer.subscription.updated', subscription)).status).toBe(500);
  });

  it('rejects invalid signatures without database access', async () => {
    mocks.verify.mockImplementation(() => { throw new Error('invalid'); });
    const response = await webhook(new Request('http://localhost/api/webhooks/stripe', { method: 'POST', headers: { 'stripe-signature': 'bad' }, body: 'raw' }));
    expect(response.status).toBe(400);
    expect(mocks.from).not.toHaveBeenCalled();
  });
});

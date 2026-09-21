import { describe, expect, it } from 'vitest';
import { isProSubscription, planName, type SubscriptionRecord } from '../../apps/web/lib/billing';

describe('access control & subscription state', () => {
  it('identifies active and trialing subscriptions as Pro', () => {
    const active: SubscriptionRecord = {
      status: 'active',
      stripe_price_id: 'price_123',
      current_period_end: '2026-12-31T23:59:59Z',
      cancel_at_period_end: false,
    };
    const trialing: SubscriptionRecord = {
      status: 'trialing',
      stripe_price_id: 'price_123',
      current_period_end: '2026-12-31T23:59:59Z',
      cancel_at_period_end: false,
    };

    expect(isProSubscription(active)).toBe(true);
    expect(isProSubscription(trialing)).toBe(true);
    expect(planName(active)).toBe('Pro');
    expect(planName(trialing)).toBe('Pro');
  });

  it('treats null, past_due, canceled, incomplete or unpaid as Free', () => {
    expect(isProSubscription(null)).toBe(false);
    expect(planName(null)).toBe('Free');

    const statuses = ['past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid'];
    for (const status of statuses) {
      const record: SubscriptionRecord = {
        status,
        stripe_price_id: 'price_123',
        current_period_end: null,
        cancel_at_period_end: false,
      };
      expect(isProSubscription(record)).toBe(false);
      expect(planName(record)).toBe('Free');
    }
  });
});

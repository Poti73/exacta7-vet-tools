export type SubscriptionRecord = {
  status: string;
  stripe_price_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
} | null;

export type UserAccessState = {
  isAuthenticated: boolean;
  isPro: boolean;
  userId: string | null;
};

export function isProSubscription(subscription: SubscriptionRecord) {
  return subscription?.status === 'active' || subscription?.status === 'trialing';
}

export function planName(subscription: SubscriptionRecord) {
  return isProSubscription(subscription) ? 'Pro' : 'Free';
}


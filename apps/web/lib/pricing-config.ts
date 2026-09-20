// Displayed prices are deliberately separate from Stripe Price IDs. Update both
// display variables and the corresponding Stripe Price ID only after creating
// matching prices in the same Stripe mode (test or live).
export const pricingConfig = {
  display: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_DISPLAY_PRICE ?? '9,90 €',
    yearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_DISPLAY_PRICE ?? '99 €',
  },
  nextApprovedPrice: { monthly: '7,99 €', yearly: '59,99 €' },
  intervals: { monthly: 'monthly', yearly: 'yearly' } as const,
};

export type AnalyticsEvent = 'contact_form_open' | 'contact_form_submitted' | 'cookie_consent_updated';

declare global { interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void } }

export function trackEvent(name: AnalyticsEvent, parameters: Record<string, string | number | boolean> = {}) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', name, parameters);
}

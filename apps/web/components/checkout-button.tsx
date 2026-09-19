'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useI18n } from './i18n';

export function CheckoutButton({ interval }: { interval: 'monthly' | 'yearly' }) {
  const { locale } = useI18n();
  const t = locale === 'en' ? { opening: 'Opening Stripe…', monthly: 'Choose Pro monthly', yearly: 'Choose Pro annual', checkoutError: 'Stripe Checkout could not be opened. Try again.' } : locale === 'fr' ? { opening: 'Ouverture de Stripe…', monthly: 'Choisir Pro mensuel', yearly: 'Choisir Pro annuel', checkoutError: 'Impossible d’ouvrir Stripe Checkout. Réessayez.' } : { opening: 'Abriendo Stripe…', monthly: 'Elegir Pro mensual', yearly: 'Elegir Pro anual', checkoutError: 'No se pudo abrir Stripe Checkout. Inténtalo de nuevo.' };
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function checkout() {
    setBusy(true);
    const response = await fetch('/api/billing/checkout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ interval }) }).catch(() => null);
    if (response?.status === 401) { router.push('/acceso?next=/planes'); return; }
    const payload = response?.ok ? await response.json() as { url: string } : null;
    if (payload?.url) window.location.assign(payload.url);
    else { setBusy(false); window.alert(t.checkoutError); }
  }
  return <button className="primary" type="button" onClick={checkout} disabled={busy}>{busy ? t.opening : interval === 'yearly' ? t.yearly : t.monthly} <span aria-hidden>→</span></button>;
}

export function PortalButton() {
  const { locale } = useI18n();
  const t = locale === 'en' ? { opening: 'Opening…', manage: 'Manage subscription', error: 'The billing portal could not be opened.' } : locale === 'fr' ? { opening: 'Ouverture…', manage: 'Gérer l’abonnement', error: 'Impossible d’ouvrir le portail de facturation.' } : { opening: 'Abriendo…', manage: 'Gestionar suscripción', error: 'No se pudo abrir el portal de facturación.' };
  const [busy, setBusy] = useState(false);
  async function openPortal() {
    setBusy(true);
    const response = await fetch('/api/billing/portal', { method: 'POST' }).catch(() => null);
    const payload = response?.ok ? await response.json() as { url: string } : null;
    if (payload?.url) window.location.assign(payload.url);
    else { setBusy(false); window.alert(t.error); }
  }
  return <button type="button" onClick={openPortal} disabled={busy}>{busy ? t.opening : t.manage}</button>;
}

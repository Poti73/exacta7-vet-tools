'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function CheckoutButton({ interval }: { interval: 'monthly' | 'yearly' }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function checkout() {
    setBusy(true);
    const response = await fetch('/api/billing/checkout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ interval }) }).catch(() => null);
    if (response?.status === 401) { router.push('/acceso?next=/planes'); return; }
    const payload = response?.ok ? await response.json() as { url: string } : null;
    if (payload?.url) window.location.assign(payload.url);
    else { setBusy(false); window.alert('No se pudo abrir Stripe Checkout. Inténtalo de nuevo.'); }
  }
  return <button className="primary" type="button" onClick={checkout} disabled={busy}>{busy ? 'Abriendo Stripe…' : interval === 'yearly' ? 'Elegir Pro anual' : 'Elegir Pro mensual'} <span aria-hidden>→</span></button>;
}

export function PortalButton() {
  const [busy, setBusy] = useState(false);
  async function openPortal() {
    setBusy(true);
    const response = await fetch('/api/billing/portal', { method: 'POST' }).catch(() => null);
    const payload = response?.ok ? await response.json() as { url: string } : null;
    if (payload?.url) window.location.assign(payload.url);
    else { setBusy(false); window.alert('No se pudo abrir el portal de facturación.'); }
  }
  return <button type="button" onClick={openPortal} disabled={busy}>{busy ? 'Abriendo…' : 'Gestionar suscripción'}</button>;
}

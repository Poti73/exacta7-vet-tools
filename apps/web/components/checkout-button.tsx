'use client';

import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import { useI18n } from './i18n';
import { isCustomerType, type CustomerType } from '../lib/billing';

export function CheckoutButton({ interval }: { interval: 'monthly' | 'yearly' }) {
  const { locale } = useI18n();
  const t = locale === 'en' ? { opening: 'Opening Stripe…', monthly: 'Choose Pro monthly', yearly: 'Choose Pro annual', checkoutError: 'Stripe Checkout could not be opened. Try again.' } : locale === 'fr' ? { opening: 'Ouverture de Stripe…', monthly: 'Choisir Pro mensuel', yearly: 'Choisir Pro annuel', checkoutError: 'Impossible d’ouvrir Stripe Checkout. Réessayez.' } : { opening: 'Abriendo Stripe…', monthly: 'Elegir Pro mensual', yearly: 'Elegir Pro anual', checkoutError: 'No se pudo abrir Stripe Checkout. Inténtalo de nuevo.' };
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [customerType, setCustomerType] = useState<CustomerType | ''>('');
  const selectId = useId();
  const buyer = locale === 'en'
    ? { label: 'I am buying as', choose: 'Select an option', business: 'Business / professional', individual: 'Individual', conflict: 'Your billing profile contains business details. Contact support to review them before buying as an individual.' }
    : locale === 'fr'
      ? { label: 'J’achète en tant que', choose: 'Sélectionnez une option', business: 'Entreprise / professionnel', individual: 'Particulier', conflict: 'Votre profil de facturation contient des informations professionnelles. Contactez le support pour les vérifier avant d’acheter en tant que particulier.' }
      : { label: 'Compro como', choose: 'Selecciona una opción', business: 'Empresa / profesional', individual: 'Particular', conflict: 'Tu perfil de facturación contiene datos empresariales. Contacta con soporte para revisarlos antes de comprar como particular.' };
  async function checkout() {
    if (!isCustomerType(customerType)) return;
    setBusy(true);
    const response = await fetch('/api/billing/checkout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ interval, customer_type: customerType }) }).catch(() => null);
    if (response?.status === 401) { router.push('/acceso?next=/planes'); return; }
    const payload = response ? await response.json().catch(() => null) as { url?: string; error?: string } | null : null;
    if (payload?.error === 'billing_identity_conflict') { setBusy(false); window.alert(buyer.conflict); return; }
    if (payload?.url) window.location.assign(payload.url);
    else { setBusy(false); window.alert(t.checkoutError); }
  }
  return <>
    <label htmlFor={selectId}>{buyer.label}</label>
    <select id={selectId} value={customerType} disabled={busy} required onChange={event => setCustomerType(isCustomerType(event.target.value) ? event.target.value : '')}>
      <option value="" disabled>{buyer.choose}</option>
      <option value="business">{buyer.business}</option>
      <option value="individual">{buyer.individual}</option>
    </select>
    <button className="primary" type="button" onClick={checkout} disabled={busy || !customerType}>{busy ? t.opening : interval === 'yearly' ? t.yearly : t.monthly} <span aria-hidden>→</span></button>
  </>;
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

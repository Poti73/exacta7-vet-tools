'use client';

import Link from 'next/link';
import { PortalButton } from './checkout-button';
import { useI18n } from './i18n';

export function AccountDashboard({ email, plan, status, renewsAt, cancelAtPeriodEnd }: { email: string; plan: 'Free' | 'Pro'; status: string | null; renewsAt: string | null; cancelAtPeriodEnd: boolean }) {
  const { locale } = useI18n();
  const date = renewsAt ? new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(renewsAt)) : null;
  const isPro = plan === 'Pro';
  return <><section className="page-intro compact"><p className="eyebrow green">MI CUENTA</p><h1>Exacta7 {plan}</h1><p className="lead">{email}</p></section><section className="account-panel panel"><div><p className="eyebrow">PLAN ACTUAL</p><h2>{isPro ? 'Exacta7 Pro' : 'Exacta7 Free'}</h2><p>{isPro ? 'Tu acceso Pro se sincroniza automáticamente con Stripe.' : 'Tienes acceso al buscador, vademécum AEMPS y herramientas esenciales.'}</p>{status && <p className="small-text muted">Estado de Stripe: {status}{date ? ` · Próxima renovación: ${date}` : ''}{cancelAtPeriodEnd ? ' · Cancelación programada al final del periodo.' : ''}</p>}</div><div className="account-panel-actions">{isPro ? <PortalButton/> : <Link className="primary" href="/planes">Ver Exacta7 Pro <span aria-hidden>→</span></Link>}<Link href="/calculadoras">Ir a herramientas →</Link></div></section></>;
}

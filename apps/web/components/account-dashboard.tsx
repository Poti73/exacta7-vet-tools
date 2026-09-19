'use client';

import Link from 'next/link';
import { PortalButton } from './checkout-button';
import { useI18n } from './i18n';

export function AccountDashboard({ email, plan, status, renewsAt, cancelAtPeriodEnd }: { email: string; plan: 'Free' | 'Pro'; status: string | null; renewsAt: string | null; cancelAtPeriodEnd: boolean }) {
  const { locale } = useI18n();
  const t = locale === 'en' ? { eye: 'MY ACCOUNT', current: 'CURRENT PLAN', pro: 'Your Pro access is automatically synchronised with Stripe.', free: 'You have access to clinical search, the AEMPS formulary and essential tools.', stripe: 'Stripe status', renewal: 'Next renewal', cancellation: 'Cancellation scheduled at the end of the period.', manage: 'Manage subscription', seePro: 'See Exacta7 Pro', tools: 'Go to tools' } : locale === 'fr' ? { eye: 'MON COMPTE', current: 'FORMULE ACTUELLE', pro: 'Votre accès Pro est synchronisé automatiquement avec Stripe.', free: 'Vous avez accès à la recherche clinique, au formulaire AEMPS et aux outils essentiels.', stripe: 'Statut Stripe', renewal: 'Prochain renouvellement', cancellation: 'Annulation programmée à la fin de la période.', manage: 'Gérer l’abonnement', seePro: 'Voir Exacta7 Pro', tools: 'Aller aux outils' } : { eye: 'MI CUENTA', current: 'PLAN ACTUAL', pro: 'Tu acceso Pro se sincroniza automáticamente con Stripe.', free: 'Tienes acceso al buscador, vademécum AEMPS y herramientas esenciales.', stripe: 'Estado de Stripe', renewal: 'Próxima renovación', cancellation: 'Cancelación programada al final del periodo.', manage: 'Gestionar suscripción', seePro: 'Ver Exacta7 Pro', tools: 'Ir a herramientas' };
  const date = renewsAt ? new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(renewsAt)) : null;
  const isPro = plan === 'Pro';
  return <><section className="page-intro compact"><p className="eyebrow green">{t.eye}</p><h1>Exacta7 {plan}</h1><p className="lead">{email}</p></section><section className="account-panel panel"><div><p className="eyebrow">{t.current}</p><h2>{isPro ? 'Exacta7 Pro' : 'Exacta7 Free'}</h2><p>{isPro ? t.pro : t.free}</p>{status && <p className="small-text muted">{t.stripe}: {status}{date ? ` · ${t.renewal}: ${date}` : ''}{cancelAtPeriodEnd ? ` · ${t.cancellation}` : ''}</p>}</div><div className="account-panel-actions">{isPro ? <PortalButton/> : <Link className="primary" href="/planes">{t.seePro} <span aria-hidden>→</span></Link>}<Link href="/calculadoras">{t.tools} →</Link></div></section></>;
}

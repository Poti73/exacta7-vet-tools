import { redirect } from 'next/navigation';
import { AccountDashboard } from '../../components/account-dashboard';
import { planName, type SubscriptionRecord } from '../../lib/billing';
import { createClient } from '../../lib/supabase/server';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Mi cuenta', robots: { index: false, follow: false } };

export default async function Page() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = typeof data?.claims?.sub === 'string' ? data.claims.sub : null;
  if (error || !userId) redirect('/acceso?next=/cuenta');
  const { data: userData } = await supabase.auth.getUser();
  const { data: subscription } = await supabase.from('subscriptions').select('status,stripe_price_id,current_period_end,cancel_at_period_end').eq('user_id', userId).order('updated_at', { ascending: false }).limit(1).maybeSingle();
  const record = subscription as SubscriptionRecord;
  return <AccountDashboard email={userData.user?.email ?? ''} plan={planName(record)} status={record?.status ?? null} renewsAt={record?.current_period_end ?? null} cancelAtPeriodEnd={record?.cancel_at_period_end ?? false} />;
}

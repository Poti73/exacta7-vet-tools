import { createAdminClient } from './supabase/admin';
import { planName, type SubscriptionRecord } from './billing';
import type { User } from '@supabase/supabase-js';

const DEFAULT_ADMIN_EMAILS = ['info@exacta7.com'];

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const configured = process.env.ADMIN_EMAILS
    ? process.env.ADMIN_EMAILS.split(',').map(item => item.trim().toLowerCase())
    : DEFAULT_ADMIN_EMAILS;
  return configured.includes(email.trim().toLowerCase());
}

export interface CrmUserSummary {
  id: string;
  email: string;
  createdAt: string;
  lastSignInAt: string | null;
  stripeCustomerId: string | null;
  plan: 'Pro' | 'Free';
  subscriptionStatus: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  stripePriceId: string | null;
}

export interface CrmStats {
  totalUsers: number;
  proUsers: number;
  freeUsers: number;
  cancelingUsers: number;
}

export async function getCrmData(): Promise<{ users: CrmUserSummary[]; stats: CrmStats }> {
  const admin = createAdminClient();

  // 1. Obtener todos los usuarios de Supabase Auth
  const authUsers: User[] = [];
  for (let page = 1; ; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    authUsers.push(...data.users);
    if (data.users.length < 1000) break;
  }

  // 2. Obtener perfiles para asociar stripe_customer_id
  const { data: profiles, error: profilesError } = await admin
    .from('profiles')
    .select('id, stripe_customer_id');
  if (profilesError) throw profilesError;

  const profileMap = new Map<string, string | null>();
  profiles?.forEach(p => profileMap.set(p.id, p.stripe_customer_id));

  // 3. Obtener suscripciones para cada usuario
  const { data: subscriptions, error: subsError } = await admin
    .from('subscriptions')
    .select('user_id, status, stripe_price_id, current_period_end, cancel_at_period_end, updated_at')
    .order('updated_at', { ascending: false });
  if (subsError) throw subsError;

  const latestSubMap = new Map<string, SubscriptionRecord>();
  subscriptions?.forEach(sub => {
    if (!latestSubMap.has(sub.user_id)) {
      latestSubMap.set(sub.user_id, sub);
    }
  });

  // 4. Mapear usuarios y calcular estadísticas
  let proCount = 0;
  let cancelingCount = 0;

  const users: CrmUserSummary[] = authUsers.map(u => {
    const subRecord = latestSubMap.get(u.id);
    const plan = planName(subRecord ?? null) as 'Pro' | 'Free';
    const status = subRecord?.status ?? 'sin suscripción';
    const cancelAtPeriodEnd = subRecord?.cancel_at_period_end ?? false;

    if (plan === 'Pro') proCount++;
    if (cancelAtPeriodEnd) cancelingCount++;

    return {
      id: u.id,
      email: u.email ?? 'Sin email',
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at ?? null,
      stripeCustomerId: profileMap.get(u.id) ?? null,
      plan,
      subscriptionStatus: status,
      currentPeriodEnd: subRecord?.current_period_end ?? null,
      cancelAtPeriodEnd,
      stripePriceId: subRecord?.stripe_price_id ?? null,
    };
  });

  users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const stats: CrmStats = {
    totalUsers: users.length,
    proUsers: proCount,
    freeUsers: Math.max(0, users.length - proCount),
    cancelingUsers: cancelingCount,
  };

  return { users, stats };
}

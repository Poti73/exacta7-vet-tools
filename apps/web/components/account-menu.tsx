'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient, hasSupabasePublicConfig, type SupabasePublicConfig } from '../lib/supabase/client';
import { useI18n } from './i18n';

export function AccountMenu() {
  const { locale } = useI18n();
  const t = locale === 'en' ? { signIn: 'Sign in', account: 'My account', signOut: 'Sign out' } : locale === 'fr' ? { signIn: 'Se connecter', account: 'Mon compte', signOut: 'Se déconnecter' } : { signIn: 'Acceder', account: 'Mi cuenta', signOut: 'Salir' };
  const [signedIn, setSignedIn] = useState(false);
  const [config, setConfig] = useState<SupabasePublicConfig | null>();
  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;
    void fetch('/api/auth/config', { cache: 'no-store' }).then(async response => response.ok ? response.json() as Promise<SupabasePublicConfig> : null).then(nextConfig => {
      if (!active) return;
      setConfig(nextConfig);
      if (!hasSupabasePublicConfig(nextConfig)) return;
      const supabase = createClient(nextConfig);
      void supabase.auth.getUser().then(({ data }) => { if (active) setSignedIn(Boolean(data.user)); });
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(Boolean(session?.user)));
      unsubscribe = () => listener.subscription.unsubscribe();
    }).catch(() => { if (active) setConfig(null); });
    return () => { active = false; unsubscribe?.(); };
  }, []);
  if (config === undefined) return null;
  if (!hasSupabasePublicConfig(config)) return null;
  if (!signedIn) return <Link className="account-link" href="/acceso?next=/cuenta">{t.signIn}</Link>;
  return (
    <span className="account-actions">
      {config.isAdmin && <Link className="account-link crm-link-tag" href="/admin/crm">CRM</Link>}
      <Link className="account-link" href="/cuenta">{t.account}</Link>
      <button type="button" className="inline-button" onClick={() => { void createClient(config).auth.signOut(); }}>{t.signOut}</button>
    </span>
  );
}

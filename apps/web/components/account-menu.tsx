'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient, hasSupabasePublicConfig, type SupabasePublicConfig } from '../lib/supabase/client';

export function AccountMenu() {
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
  if (!signedIn) return <Link className="account-link" href="/acceso?next=/cuenta">Acceder</Link>;
  return <span className="account-actions"><Link className="account-link" href="/cuenta">Mi cuenta</Link><button type="button" className="inline-button" onClick={() => { void createClient(config).auth.signOut(); }}>Salir</button></span>;
}

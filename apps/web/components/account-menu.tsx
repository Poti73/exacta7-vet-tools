'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient, hasSupabasePublicConfig } from '../lib/supabase/client';

export function AccountMenu() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    if (!hasSupabasePublicConfig()) return;
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(Boolean(session?.user)));
    return () => listener.subscription.unsubscribe();
  }, []);
  if (!hasSupabasePublicConfig()) return null;
  if (!signedIn) return <Link className="account-link" href="/acceso?next=/cuenta">Acceder</Link>;
  return <span className="account-actions"><Link className="account-link" href="/cuenta">Mi cuenta</Link><button type="button" className="inline-button" onClick={() => { void createClient().auth.signOut(); }}>Salir</button></span>;
}

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { createClient, hasSupabasePublicConfig, type SupabasePublicConfig } from '../lib/supabase/client';

export function AuthForm({ nextPath = '/cuenta' }: { nextPath?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [config, setConfig] = useState<SupabasePublicConfig | null>();
  const safeNext = nextPath.startsWith('/') && !nextPath.startsWith('//') ? nextPath : '/cuenta';

  useEffect(() => {
    void fetch('/api/auth/config', { cache: 'no-store' })
      .then(async response => response.ok ? response.json() as Promise<SupabasePublicConfig> : null)
      .then(setConfig)
      .catch(() => setConfig(null));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(''); setBusy(true);
    try {
      if (!hasSupabasePublicConfig(config)) throw new Error('La autenticación todavía no está disponible en este entorno.');
      const supabase = createClient(config);
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}` } });
        if (error) throw error;
        if (data.session) router.replace(safeNext);
        else setMessage('Revisa tu correo y confirma la cuenta para continuar.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace(safeNext); router.refresh();
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo completar el acceso.'); }
    finally { setBusy(false); }
  }

  if (config === undefined) return <section className="panel narrow"><h1>Preparando acceso…</h1></section>;
  if (!hasSupabasePublicConfig(config)) return <section className="panel narrow"><h1>Acceso en preparación</h1><p>La autenticación todavía no está disponible en este entorno.</p></section>;
  return <section className="auth-card panel narrow"><p className="eyebrow green">EXACTA7 ACCOUNT</p><h1>{mode === 'signup' ? 'Crea tu cuenta' : 'Accede a Exacta7'}</h1><p className="lead">Tu cuenta Free te permite identificarte y gestionar tu plan. El catálogo clínico público permanece disponible sin registro.</p><form className="form-stack" onSubmit={submit}><label>Correo electrónico<input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required /></label><label>Contraseña<input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={8} required /></label>{mode === 'signup' && <label className="checkbox"><input type="checkbox" required /><span>Acepto la <Link href="/privacidad">política de privacidad</Link> y el uso de mis datos para crear mi cuenta.</span></label>}<button className="primary" type="submit" disabled={busy}>{busy ? 'Un momento…' : mode === 'signup' ? 'Crear cuenta gratis' : 'Acceder'} <span aria-hidden>→</span></button>{message && <p role="status" className={message.startsWith('Revisa') ? 'success-text' : 'error-text'}>{message}</p>}</form><p className="small-text">{mode === 'signup' ? '¿Ya tienes cuenta?' : '¿Aún no tienes cuenta?'} <button className="inline-button" type="button" onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setMessage(''); }}>{mode === 'signup' ? 'Acceder' : 'Crear cuenta gratis'}</button></p></section>;
}

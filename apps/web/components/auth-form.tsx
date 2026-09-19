'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { createClient, hasSupabasePublicConfig, type SupabasePublicConfig } from '../lib/supabase/client';
import { useI18n } from './i18n';

export function AuthForm({ nextPath = '/cuenta' }: { nextPath?: string }) {
  const { locale } = useI18n();
  const t = locale === 'en' ? { unavailable: 'Authentication is not available in this environment yet.', preparing: 'Preparing access…', setup: 'Access is being prepared', account: 'EXACTA7 ACCOUNT', create: 'Create your account', signIn: 'Sign in to Exacta7', lead: 'Your Free account lets you identify yourself and manage your plan. The public clinical catalogue remains available without registration.', email: 'Email address', password: 'Password', consent: 'I accept the', privacy: 'privacy policy', consentEnd: 'and the use of my data to create my account.', wait: 'One moment…', createFree: 'Create free account', access: 'Sign in', created: 'Account created! Check your email to confirm it.', spam: 'Important:', spamText: 'The confirmation email may arrive in Spam or Promotions. Please check those folders and mark the message as safe if needed.', have: 'Already have an account?', noAccount: 'Don’t have an account yet?', failure: 'Access could not be completed.' } : locale === 'fr' ? { unavailable: 'L’authentification n’est pas encore disponible dans cet environnement.', preparing: 'Préparation de l’accès…', setup: 'Accès en préparation', account: 'COMPTE EXACTA7', create: 'Créez votre compte', signIn: 'Accédez à Exacta7', lead: 'Votre compte Gratuit vous permet de vous identifier et de gérer votre formule. Le catalogue clinique public reste accessible sans inscription.', email: 'Adresse e-mail', password: 'Mot de passe', consent: 'J’accepte la', privacy: 'politique de confidentialité', consentEnd: 'et l’utilisation de mes données pour créer mon compte.', wait: 'Un instant…', createFree: 'Créer un compte gratuit', access: 'Se connecter', created: 'Compte créé ! Consultez votre e-mail pour le confirmer.', spam: 'Important :', spamText: 'L’e-mail de confirmation peut arriver dans les spams ou les promotions. Vérifiez ces dossiers et marquez le message comme sûr si nécessaire.', have: 'Vous avez déjà un compte ?', noAccount: 'Vous n’avez pas encore de compte ?', failure: 'Impossible de finaliser l’accès.' } : { unavailable: 'La autenticación todavía no está disponible en este entorno.', preparing: 'Preparando acceso…', setup: 'Acceso en preparación', account: 'CUENTA EXACTA7', create: 'Crea tu cuenta', signIn: 'Accede a Exacta7', lead: 'Tu cuenta Gratis te permite identificarte y gestionar tu plan. El catálogo clínico público permanece disponible sin registro.', email: 'Correo electrónico', password: 'Contraseña', consent: 'Acepto la', privacy: 'política de privacidad', consentEnd: 'y el uso de mis datos para crear mi cuenta.', wait: 'Un momento…', createFree: 'Crear cuenta gratis', access: 'Acceder', created: '¡Cuenta creada! Revisa tu correo para confirmarla.', spam: 'Importante:', spamText: 'El email de confirmación puede llegar a tu carpeta de Correo no deseado (Spam) o Promociones. Por favor revísala y marca el correo como seguro si no lo ves en tu bandeja de entrada.', have: '¿Ya tienes cuenta?', noAccount: '¿Aún no tienes cuenta?', failure: 'No se pudo completar el acceso.' };
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
      if (!hasSupabasePublicConfig(config)) throw new Error(t.unavailable);
      const supabase = createClient(config);
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}` } });
        if (error) throw error;
        if (data.session) router.replace(safeNext);
        else setMessage('confirmation_sent');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace(safeNext); router.refresh();
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : t.failure); }
    finally { setBusy(false); }
  }

  if (config === undefined) return <section className="panel narrow"><h1>{t.preparing}</h1></section>;
  if (!hasSupabasePublicConfig(config)) return <section className="panel narrow"><h1>{t.setup}</h1><p>{t.unavailable}</p></section>;
  return (
    <section className="auth-card panel narrow">
      <p className="eyebrow green">{t.account}</p>
      <h1>{mode === 'signup' ? t.create : t.signIn}</h1>
      <p className="lead">{t.lead}</p>
      <form className="form-stack" onSubmit={submit}>
        <label>{t.email}<input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required /></label>
        <label>{t.password}<input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={8} required /></label>
        {mode === 'signup' && (
          <label className="checkbox">
            <input type="checkbox" required />
            <span>{t.consent} <Link href="/privacidad">{t.privacy}</Link> {t.consentEnd}</span>
          </label>
        )}
        <button className="primary" type="submit" disabled={busy}>
          {busy ? t.wait : mode === 'signup' ? t.createFree : t.access} <span aria-hidden>→</span>
        </button>
        {message === 'confirmation_sent' ? (
          <div className="auth-notice-box" role="status">
            <strong className="success-text">{t.created}</strong>
            <p className="small-text spam-alert">
              ⚠️ <strong>{t.spam}</strong> {t.spamText}
            </p>
          </div>
        ) : message ? (
          <p role="status" className="error-text">{message}</p>
        ) : null}
      </form>
      <p className="small-text">
        {mode === 'signup' ? t.have : t.noAccount}{' '}
        <button className="inline-button" type="button" onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setMessage(''); }}>
          {mode === 'signup' ? t.access : t.createFree}
        </button>
      </p>
    </section>
  );
}

'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n } from './i18n';
import { trackEvent } from '../lib/analytics';

const key = 'exacta7-analytics-consent';
export function CookieConsent() {
  const { locale } = useI18n();
  const [visible, setVisible] = useState(false);
  // Consent lives in browser storage and is only available after hydration.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { const saved = localStorage.getItem(key); if (!saved) setVisible(true); else if (saved === 'granted') window.gtag?.('consent','update',{ analytics_storage:'granted' }); }, []);
  if (!visible) return null;
  const text = {
    es:{title:'Privacidad y medición',body:'Usamos medición anónima para mejorar Exacta7. Nunca enviamos datos del paciente, dosis, concentraciones ni textos de búsqueda a Google Analytics.',reject:'Solo necesarias',accept:'Aceptar analítica',more:'Política de cookies'},
    en:{title:'Privacy and analytics',body:'We use anonymous analytics to improve Exacta7. Patient data, doses, concentrations and search text are never sent to Google Analytics.',reject:'Necessary only',accept:'Accept analytics',more:'Cookie policy'},
    fr:{title:'Confidentialité et mesure',body:'Nous utilisons des mesures anonymes pour améliorer Exacta7. Les données patient, doses, concentrations et recherches ne sont jamais envoyées à Google Analytics.',reject:'Nécessaires uniquement',accept:'Accepter les mesures',more:'Politique des cookies'},
  }[locale];
  function choose(value:'granted'|'denied') { localStorage.setItem(key,value); window.gtag?.('consent','update',{ analytics_storage:value }); trackEvent('cookie_consent_updated',{ analytics_consent:value }); setVisible(false); }
  return <aside className="cookie-banner" aria-label={text.title}><div><strong>{text.title}</strong><p>{text.body} <Link href="/cookies">{text.more}</Link>.</p></div><div className="cookie-actions"><button onClick={()=>choose('denied')}>{text.reject}</button><button className="primary" onClick={()=>choose('granted')}>{text.accept}</button></div></aside>;
}

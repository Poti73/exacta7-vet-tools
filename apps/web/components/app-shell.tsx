'use client';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { PatientProvider } from './patient-context';
import { PatientStrip } from './patient';
import { ClinicalSearch } from './search';
import { LanguageSelector, LocaleProvider, useI18n } from './i18n';
import { CookieConsent } from './cookie-consent';
import { AccountMenu } from './account-menu';

function Shell({ children }: { children: ReactNode }) {
  const { t, locale } = useI18n();
  const slogan = locale === 'en' ? 'Better decisions. Healthier animals.' : locale === 'fr' ? 'De meilleures décisions. Des animaux en meilleure santé.' : 'Mejores decisiones. Animales más sanos.';
  return <PatientProvider><a href="#main" className="skip-link">{t('skip')}</a><header><div className="wrap header-inner"><Link className="brand" href="/" aria-label={`Exacta7, ${t('home')}`}><span className="brand-symbol" aria-hidden>≋</span>EXACTA<span>7</span></Link><nav aria-label={t('navLabel')}><Link href="/medicamentos">{t('navMedicines')}</Link><Link href="/indicaciones">{t('navIndications')}</Link><Link href="/calculadoras">{t('navTools')}</Link><Link href="/historial">{t('navHistory')}</Link><Link href="/planes">{t('plans')}</Link><Link href="/fuentes">{t('navSources')}</Link><Link href="/sobre-exacta7">{t('navAbout')}</Link><Link href="/contacto">{t('navContact')}</Link></nav><LanguageSelector/><AccountMenu/><ClinicalSearch compact /></div></header><PatientStrip/><main id="main" className="wrap main">{children}</main><footer className="site-footer wrap"><span className="brand small">EXACTA<span>7</span></span><p>{slogan}</p><Link href="/indicaciones">{t('navIndications')}</Link><Link href="/historial">{t('navHistory')}</Link><Link href="/planes">{t('plans')}</Link><Link href="/fuentes">{t('footerMethod')}</Link><Link href="/sobre-exacta7">{t('navAbout')}</Link><Link href="/contacto">{t('navContact')}</Link><Link href="/privacidad">{t('privacy')}</Link><Link href="/cookies">{t('cookies')}</Link><p className="footer-credit">{t('footerCredit')} <a href="https://dentromarketing.es" target="_blank" rel="noopener">Dentro Marketing</a> · {t('footerCreditTail')}</p><span className="muted">{t('footerStatus')}</span></footer><CookieConsent/></PatientProvider>;
}
export function AppShell({ children }: { children: ReactNode }) { return <LocaleProvider><Shell>{children}</Shell></LocaleProvider>; }

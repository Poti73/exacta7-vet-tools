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
  const { t } = useI18n();
  return <PatientProvider><a href="#main" className="skip-link">{t('skip')}</a><header><div className="wrap header-inner"><Link className="brand" href="/" aria-label={`Exacta7, ${t('home')}`}><span className="brand-symbol" aria-hidden>≋</span>EXACTA<span>7</span></Link><nav aria-label={t('navLabel')}><Link href="/medicamentos">{t('navMedicines')}</Link><Link href="/calculadoras">{t('navTools')}</Link><Link href="/planes">Planes</Link><Link href="/fuentes">{t('navSources')}</Link><Link href="/sobre-exacta7">{t('navAbout')}</Link><Link href="/contacto">{t('navContact')}</Link></nav><LanguageSelector/><AccountMenu/><ClinicalSearch compact /></div></header><PatientStrip/><main id="main" className="wrap main">{children}</main><footer className="site-footer wrap"><span className="brand small">EXACTA<span>7</span></span><p>Better decisions. Healthier animals.</p><Link href="/planes">Planes</Link><Link href="/fuentes">{t('footerMethod')}</Link><Link href="/sobre-exacta7">{t('navAbout')}</Link><Link href="/contacto">{t('navContact')}</Link><Link href="/privacidad">{t('privacy')}</Link><Link href="/cookies">Cookies</Link><p className="footer-credit">{t('footerCredit')} <a href="https://dentromarketing.es" target="_blank" rel="noopener">Dentro Marketing</a> · {t('footerCreditTail')}</p><span className="muted">{t('footerStatus')}</span></footer><CookieConsent/></PatientProvider>;
}
export function AppShell({ children }: { children: ReactNode }) { return <LocaleProvider><Shell>{children}</Shell></LocaleProvider>; }

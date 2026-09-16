import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { PatientProvider } from '../components/patient-context';
import { PatientStrip } from '../components/patient';
import { ClinicalSearch } from '../components/search';
import './globals.css';
export const metadata: Metadata = { title: { default: 'Exacta7 · Herramientas clínicas veterinarias', template: '%s · Exacta7' }, description: 'Busca, calcula y consulta las fuentes detrás del resultado.', robots: { index: false, follow: false } };
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="es" data-scroll-behavior="smooth"><body><PatientProvider><a href="#main" className="skip-link">Saltar al contenido</a><header><div className="wrap header-inner"><Link className="brand" href="/" aria-label="Exacta7, inicio"><span className="brand-symbol" aria-hidden>≋</span>EXACTA<span>7</span></Link><nav aria-label="Navegación principal"><Link href="/medicamentos">Vademécum</Link><Link href="/calculadoras">Herramientas</Link><Link href="/fuentes">Fuentes</Link></nav><ClinicalSearch compact /></div></header><PatientStrip/><main id="main" className="wrap main">{children}</main><footer className="site-footer wrap"><span className="brand small">EXACTA<span>7</span></span><p>Better decisions. Healthier animals.</p><Link href="/fuentes">Metodología y fuentes</Link><p className="footer-credit">Proyecto desarrollado por <a href="https://dentromarketing.es" target="_blank" rel="noopener">Dentro Marketing</a> · Tecnología con pulso veterinario.</p><span className="muted">Versión local · catálogo en preparación</span></footer></PatientProvider></body></html>;
}


import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { AppShell } from '../components/app-shell';
import './globals.css';
export const metadata: Metadata = { title: { default: 'Exacta7 · Herramientas clínicas veterinarias', template: '%s · Exacta7' }, description: 'Busca, calcula y consulta las fuentes detrás del resultado.', robots: { index: false, follow: false } };
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="es" data-scroll-behavior="smooth" suppressHydrationWarning><body suppressHydrationWarning><AppShell>{children}</AppShell></body></html>;
}


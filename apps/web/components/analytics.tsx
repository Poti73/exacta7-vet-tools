'use client';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
export function Analytics() {
  const pathname = usePathname();
  useEffect(() => {
    if (!measurementId || !window.gtag) return;
    window.gtag('event', 'page_view', { page_path: pathname, page_location: `${window.location.origin}${pathname}`, page_title: document.title });
  }, [pathname]);
  if (!measurementId) return null;
  return <><Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive"/><Script id="ga4-config" strategy="afterInteractive">{`window.gtag=window.gtag||function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','${measurementId}',{send_page_view:false,allow_google_signals:false});`}</Script></>;
}

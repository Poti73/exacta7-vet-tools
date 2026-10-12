'use client';

import Link from 'next/link';
import { useI18n } from './i18n';
import { betaCopy } from '../lib/beta-copy';

export function BetaAccess() {
  const { locale } = useI18n();
  const t = betaCopy[locale];
  return <>
    <section className="page-intro plans-intro"><p className="eyebrow green">{t.badge}</p><h1>{t.title}</h1><p className="lead">{t.lead}</p></section>
    <section className="pricing-section beta-access" aria-labelledby="beta-access-title">
      <article className="pricing-card"><p className="eyebrow">{t.badge}</p><h2 id="beta-access-title">{t.access}</h2><strong className="price">0 €</strong><ul>{t.items.map(item => <li key={item}>{item}</li>)}</ul><Link className="primary" href="/calculadoras">{t.cta} <span aria-hidden>→</span></Link></article>
      <p className="pricing-note">{t.clinical}</p>
    </section>
    <section className="plans-detail"><p>{t.future}</p><nav className="plans-links" aria-label={t.access}><Link href="/medicamentos">AEMPS/CIMA Vet →</Link><Link href="/fuentes">{t.items[4]} →</Link></nav></section>
    <section className="plans-detail"><h2>{t.feedbackTitle}</h2><p>{t.feedback}</p><Link className="primary" href="/contacto">{t.feedbackCta} →</Link></section>
    <section className="plans-detail plans-faq"><h2>{t.faqTitle}</h2>{t.faq.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</section>
  </>;
}

'use client';
import { ContactForm } from '../../components/contact-form';
import { useI18n } from '../../components/i18n';

export default function ContactPage() {
  const { locale } = useI18n();
  const t = {
    es:{eyebrow:'CONTACTO',title:'Hablemos',lead:'Consultas sobre Exacta7, colaboración, datos regulatorios o soporte técnico.',email:'También puedes escribirnos directamente a'},
    en:{eyebrow:'CONTACT',title:'Get in touch',lead:'Questions about Exacta7, collaboration, regulatory data or technical support.',email:'You can also email us directly at'},
    fr:{eyebrow:'CONTACT',title:'Contactez-nous',lead:'Questions sur Exacta7, collaboration, données réglementaires ou support technique.',email:'Vous pouvez également nous écrire directement à'},
  }[locale];
  return <><section className="page-intro compact"><p className="eyebrow">{t.eyebrow}</p><h1>{t.title}</h1><p className="lead">{t.lead}</p></section><div className="contact-layout"><section className="panel"><ContactForm/></section><aside className="context-aside"><h2>info@exacta7.com</h2><p>{t.email}</p><a className="primary" href="mailto:info@exacta7.com">info@exacta7.com</a></aside></div></>;
}

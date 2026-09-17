'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { useI18n } from './i18n';
import { trackEvent } from '../lib/analytics';

export function ContactForm() {
  const { locale } = useI18n();
  const [state, setState] = useState<'idle'|'sending'|'sent'|'error'>('idle');
  const t = {
    es:{name:'Nombre',email:'Correo electrónico',org:'Clínica u organización (opcional)',subject:'Asunto',message:'Mensaje',consent:'Acepto que Exacta7 use estos datos para responder a mi consulta.',warning:'No incluyas datos identificativos de pacientes, historias clínicas, dosis ni otra información sanitaria confidencial.',send:'Enviar consulta',sending:'Enviando…',sent:'Mensaje enviado. Te responderemos desde info@exacta7.com.',error:'No se pudo enviar. Escríbenos directamente a info@exacta7.com.'},
    en:{name:'Name',email:'Email',org:'Clinic or organisation (optional)',subject:'Subject',message:'Message',consent:'I agree that Exacta7 may use these details to answer my enquiry.',warning:'Do not include patient identifiers, medical records, doses or other confidential health information.',send:'Send enquiry',sending:'Sending…',sent:'Message sent. We will reply from info@exacta7.com.',error:'The message could not be sent. Email us at info@exacta7.com.'},
    fr:{name:'Nom',email:'E-mail',org:'Clinique ou organisation (facultatif)',subject:'Objet',message:'Message',consent:'J’accepte qu’Exacta7 utilise ces données pour répondre à ma demande.',warning:'N’incluez aucune donnée identifiant un patient, dossier médical, dose ou autre information de santé confidentielle.',send:'Envoyer',sending:'Envoi…',sent:'Message envoyé. Nous vous répondrons depuis info@exacta7.com.',error:'Le message n’a pas pu être envoyé. Écrivez-nous à info@exacta7.com.'},
  }[locale];
  useEffect(()=>trackEvent('contact_form_open'),[]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState('sending');
    const form = event.currentTarget;
    const response = await fetch('/api/contact',{ method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(Object.fromEntries(new FormData(form))) }).catch(()=>null);
    if (response?.ok) { setState('sent'); form.reset(); trackEvent('contact_form_submitted'); } else setState('error');
  }
  return <form className="form-stack contact-form" onSubmit={submit}>
    <div className="form-grid"><label>{t.name}<input name="name" autoComplete="name" required maxLength={100}/></label><label>{t.email}<input name="email" type="email" autoComplete="email" required maxLength={160}/></label></div>
    <label>{t.org}<input name="organization" autoComplete="organization" maxLength={160}/></label>
    <label>{t.subject}<input name="subject" required maxLength={160}/></label>
    <label>{t.message}<textarea name="message" required minLength={10} maxLength={4000} rows={8}/></label>
    <label className="honeypot" aria-hidden>Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
    <p className="notice">{t.warning}</p>
    <label className="checkbox"><input name="consent" type="checkbox" value="yes" required/><span>{t.consent}</span></label>
    <button className="primary" type="submit" disabled={state==='sending'}>{state==='sending'?t.sending:t.send}</button>
    {state==='sent'&&<p className="success-text" role="status">{t.sent}</p>}{state==='error'&&<p className="error-text" role="alert">{t.error}</p>}
  </form>;
}

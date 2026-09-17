import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';
const attempts = new Map<string,{ count:number; reset:number }>();

function clean(value: unknown, max: number) { return typeof value === 'string' ? value.trim().slice(0,max) : ''; }
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now(); const record = attempts.get(ip);
  if (record && record.reset > now && record.count >= 5) return NextResponse.json({ error:'rate_limited' },{ status:429 });
  attempts.set(ip, record && record.reset > now ? { ...record, count:record.count+1 } : { count:1, reset:now+3_600_000 });
  const body = await request.json().catch(()=>null) as Record<string,unknown>|null;
  if (!body || clean(body.website,200)) return NextResponse.json({ ok:true });
  const name=clean(body.name,100), email=clean(body.email,160), organization=clean(body.organization,160), subject=clean(body.subject,160), message=clean(body.message,4000), consent=clean(body.consent,10);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !subject || message.length<10 || consent!=='yes') return NextResponse.json({ error:'invalid' },{ status:400 });
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, CONTACT_TO } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) return NextResponse.json({ error:'not_configured' },{ status:503 });
  const port = Number(SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({ host:SMTP_HOST, port, secure:port===465, auth:{ user:SMTP_USER, pass:SMTP_PASSWORD } });
  await transporter.sendMail({ from:`Exacta7 web <${SMTP_USER}>`, to:CONTACT_TO||'info@exacta7.com', replyTo:email, subject:`[Exacta7] ${subject.replace(/[\r\n]/g,' ')}`, text:`Nombre: ${name}\nCorreo: ${email}\nOrganización: ${organization||'—'}\n\n${message}` });
  return NextResponse.json({ ok:true });
}

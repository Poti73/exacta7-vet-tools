import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '../../../lib/supabase/admin';
import { createClient } from '../../../lib/supabase/server';

function safeNext(value: string | null) {
  return value?.startsWith('/') && !value.startsWith('//') ? value : '/cuenta';
}

function getBaseUrl(request: NextRequest) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  if (host && !host.includes('0.0.0.0')) {
    return `${proto}://${host}`;
  }
  return process.env.NODE_ENV === 'production' ? 'https://exacta7.com' : 'http://localhost:3000';
}

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  const code = request.nextUrl.searchParams.get('code');
  const next = safeNext(request.nextUrl.searchParams.get('next'));
  if (!code) return NextResponse.redirect(new URL('/acceso?error=missing_code', baseUrl));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return NextResponse.redirect(new URL('/acceso?error=confirmation_failed', baseUrl));
  const admin = createAdminClient();
  await admin.from('profiles').upsert({ id: data.user.id }, { onConflict: 'id' });
  return NextResponse.redirect(new URL(next, baseUrl));
}


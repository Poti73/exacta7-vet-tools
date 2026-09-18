import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '../../../lib/supabase/admin';
import { createClient } from '../../../lib/supabase/server';

function safeNext(value: string | null) {
  return value?.startsWith('/') && !value.startsWith('//') ? value : '/cuenta';
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const next = safeNext(request.nextUrl.searchParams.get('next'));
  if (!code) return NextResponse.redirect(new URL('/acceso?error=missing_code', request.url));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return NextResponse.redirect(new URL('/acceso?error=confirmation_failed', request.url));
  const admin = createAdminClient();
  await admin.from('profiles').upsert({ id: data.user.id }, { onConflict: 'id' });
  return NextResponse.redirect(new URL(next, request.url));
}

import { createClient } from '../../../../lib/supabase/server';
import { isAdminEmail } from '../../../../lib/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) return Response.json({ error: 'auth_not_configured' }, { status: 503 });

  let isAdmin = false;
  try {
    const supabase = await createClient();
    const { data: claimsData } = await supabase.auth.getClaims();
    if (claimsData?.claims?.sub) {
      const { data: userData } = await supabase.auth.getUser();
      isAdmin = isAdminEmail(userData.user?.email);
    }
  } catch {
    // Si no hay sesión, continúa como usuario estándar
  }

  return Response.json({ url, publishableKey, isAdmin }, { headers: { 'Cache-Control': 'no-store' } });
}


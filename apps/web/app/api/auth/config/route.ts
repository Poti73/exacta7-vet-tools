export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) return Response.json({ error: 'auth_not_configured' }, { status: 503 });
  return Response.json({ url, publishableKey }, { headers: { 'Cache-Control': 'no-store' } });
}

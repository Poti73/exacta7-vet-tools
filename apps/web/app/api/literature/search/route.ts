import { findIndication, pubMedProvider, rankLiterature, type LiteratureSearchResult } from '@exacta7/knowledge';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const CACHE_MS = 6 * 60 * 60 * 1000;
const cache = new Map<string, { expiresAt: number; result: LiteratureSearchResult }>();

export async function GET(request: Request) {
  const url = new URL(request.url); const slug = url.searchParams.get('indication') ?? ''; const suppliedSpecies = url.searchParams.get('species'); const species: 'Perro' | 'Gato' | undefined = suppliedSpecies === 'Perro' || suppliedSpecies === 'Gato' ? suppliedSpecies : undefined;
  const indication = findIndication(slug); if (!indication) return Response.json({ error: 'unknown_indication' }, { status: 400 });
  const key = `${indication.slug}:${species ?? 'all'}`; const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return Response.json({ ...cached.result, cached: true }, { headers: { 'Cache-Control': 'private, max-age=300' } });
  const query = { indication: indication.names.en, aliases: indication.aliases, species, limit: 5 } as const;
  try {
    const publications = rankLiterature(await pubMedProvider.search(query), query);
    const result: LiteratureSearchResult = { publications, provider: 'PubMed', cached: false, retrievedAt: new Date().toISOString() };
    cache.set(key, { expiresAt: Date.now() + CACHE_MS, result }); return Response.json(result, { headers: { 'Cache-Control': 'private, max-age=300' } });
  } catch {
    if (cached) return Response.json({ ...cached.result, cached: true, unavailable: true }, { headers: { 'Cache-Control': 'private, max-age=60' } });
    return Response.json({ publications: [], provider: 'PubMed', cached: false, unavailable: true, retrievedAt: new Date().toISOString() } satisfies LiteratureSearchResult, { status: 503 });
  }
}

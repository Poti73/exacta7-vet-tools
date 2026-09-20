export type PublicationType = 'clinical_practice_guideline' | 'consensus_statement' | 'systematic_review' | 'meta_analysis' | 'randomized_clinical_trial' | 'clinical_trial' | 'observational_study' | 'case_series' | 'case_report' | 'other';
export type RetractionStatus = 'none' | 'retracted' | 'unknown';
export type CorrectionStatus = 'none' | 'corrected' | 'unknown';
export type LiteraturePublication = {
  externalId: string; pubmedId?: string; pmcId?: string; doi?: string; title: string; authors: string[]; journal?: string;
  publicationDate?: string; publicationYear?: number; abstractAvailable: boolean; fullTextAvailable: boolean; openAccess: boolean;
  publicationType: PublicationType; sourcePublicationTypes: string[]; species: string[]; keywords: string[]; meshTerms: string[];
  sourceProvider: 'pubmed' | 'europe-pmc' | 'crossref'; sourceUrl: string; doiUrl?: string; language?: string; license?: string;
  correctionStatus: CorrectionStatus; retractionStatus: RetractionStatus; retrievedAt: string; lastCheckedAt: string;
};
export type LiteratureQuery = { indication: string; aliases: readonly string[]; species?: 'Perro' | 'Gato'; limit: number };
export type LiteratureSearchResult = { publications: LiteraturePublication[]; provider: string; cached: boolean; retrievedAt: string; unavailable?: boolean };
export type LiteratureProvider = { id: 'pubmed' | 'europe-pmc' | 'crossref'; search(query: LiteratureQuery, fetcher?: typeof fetch): Promise<LiteraturePublication[]> };

const priority: Record<PublicationType, number> = { clinical_practice_guideline: 100, consensus_statement: 90, systematic_review: 80, meta_analysis: 75, randomized_clinical_trial: 70, clinical_trial: 60, observational_study: 50, case_series: 40, case_report: 30, other: 10 };
function normalized(text: string) { return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
export function classifyPublicationType(types: readonly string[]): PublicationType {
  const joined = normalized(types.join(' '));
  if (joined.includes('practice guideline')) return 'clinical_practice_guideline';
  if (joined.includes('consensus')) return 'consensus_statement';
  if (joined.includes('systematic review')) return 'systematic_review';
  if (joined.includes('meta-analysis')) return 'meta_analysis';
  if (joined.includes('randomized controlled trial')) return 'randomized_clinical_trial';
  if (joined.includes('clinical trial')) return 'clinical_trial';
  if (joined.includes('observational')) return 'observational_study';
  if (joined.includes('case series')) return 'case_series';
  if (joined.includes('case report')) return 'case_report';
  return 'other';
}
export function rankLiterature(publications: readonly LiteraturePublication[], query: LiteratureQuery) {
  const terms = [query.indication, ...query.aliases].map(normalized).filter(Boolean);
  const speciesTerms = query.species === 'Perro' ? ['dog', 'dogs', 'canine', 'canis'] : query.species === 'Gato' ? ['cat', 'cats', 'feline', 'felis'] : [];
  return publications.filter(item => item.retractionStatus !== 'retracted').map(item => {
    const title = normalized(item.title); const matchedIndication = terms.some(term => title.includes(term)); const matchedSpecies = speciesTerms.some(term => title.includes(term)) || item.species.some(species => speciesTerms.includes(normalized(species)));
    const score = priority[item.publicationType] + (matchedIndication ? 25 : 0) + (matchedSpecies ? 12 : 0) + (item.abstractAvailable ? 2 : 0) + Math.max(0, Math.min(8, (item.publicationYear ?? 0) - 2018));
    const why = [matchedIndication && query.indication, matchedSpecies && query.species, item.publicationType.replaceAll('_', ' ')].filter(Boolean) as string[];
    return { ...item, score, why };
  }).sort((a, b) => b.score - a.score || (b.publicationYear ?? 0) - (a.publicationYear ?? 0) || a.externalId.localeCompare(b.externalId)).slice(0, query.limit);
}

type PubMedSummary = { uid?: string; title?: string; authors?: { name?: string }[]; fulljournalname?: string; pubdate?: string; sortpubdate?: string; pubtype?: string[]; articleids?: { idtype?: string; value?: string }[]; lang?: string[]; hasabstract?: boolean; pmcrefcount?: number };
export function publicationFromPubMedSummary(summary: PubMedSummary): LiteraturePublication | null {
  const pmid = summary.uid; const title = summary.title?.trim(); if (!pmid || !title) return null;
  const ids = summary.articleids ?? []; const doi = ids.find(id => id.idtype === 'doi')?.value; const pmcId = ids.find(id => id.idtype === 'pmc')?.value; const sourceTypes = summary.pubtype ?? [];
  const retracted = sourceTypes.some(type => normalized(type).includes('retracted publication'));
  const year = Number((summary.sortpubdate ?? summary.pubdate ?? '').slice(0, 4)); const retrievedAt = new Date().toISOString();
  return { externalId: `pubmed:${pmid}`, pubmedId: pmid, pmcId, doi, title, authors: (summary.authors ?? []).map(author => author.name ?? '').filter(Boolean), journal: summary.fulljournalname, publicationDate: summary.pubdate, publicationYear: Number.isInteger(year) ? year : undefined, abstractAvailable: summary.hasabstract === true, fullTextAvailable: !!pmcId, openAccess: !!pmcId, publicationType: classifyPublicationType(sourceTypes), sourcePublicationTypes: sourceTypes, species: [], keywords: [], meshTerms: [], sourceProvider: 'pubmed', sourceUrl: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`, doiUrl: doi ? `https://doi.org/${doi}` : undefined, language: summary.lang?.[0], correctionStatus: 'unknown', retractionStatus: retracted ? 'retracted' : 'unknown', retrievedAt, lastCheckedAt: retrievedAt };
}

export const pubMedProvider: LiteratureProvider = { id: 'pubmed', async search(query, fetcher = fetch) {
  const searchTerms = [...query.aliases, query.indication].filter(Boolean).map(term => `"${term.replaceAll('"', '')}"`).join(' OR ');
  const species = query.species === 'Perro' ? ' AND (dog OR dogs OR canine)' : query.species === 'Gato' ? ' AND (cat OR cats OR feline)' : '';
  const params = new URLSearchParams({ db: 'pubmed', retmode: 'json', retmax: String(Math.min(query.limit * 3, 20)), term: `(${searchTerms})${species}` });
  const search = await fetcher(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?${params}`, { headers: { Accept: 'application/json' } });
  if (!search.ok) throw new Error(`pubmed_search_${search.status}`);
  const ids = ((await search.json()) as { esearchresult?: { idlist?: string[] } }).esearchresult?.idlist ?? []; if (!ids.length) return [];
  const summaryParams = new URLSearchParams({ db: 'pubmed', retmode: 'json', id: ids.join(',') }); const summaryResponse = await fetcher(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?${summaryParams}`, { headers: { Accept: 'application/json' } });
  if (!summaryResponse.ok) throw new Error(`pubmed_summary_${summaryResponse.status}`);
  const result = (await summaryResponse.json()) as { result?: Record<string, PubMedSummary> & { uids?: string[] } }; return (result.result?.uids ?? []).map(id => publicationFromPubMedSummary(result.result?.[id] ?? {})).filter((item): item is LiteraturePublication => !!item);
} };

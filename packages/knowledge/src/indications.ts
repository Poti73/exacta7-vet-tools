export type IndicationLocale = 'es' | 'en' | 'fr';
export type ClinicalIndication = {
  id: string;
  slug: string;
  names: Record<IndicationLocale, string>;
  aliases: readonly string[];
  species: readonly ('Perro' | 'Gato')[];
  indexable: boolean;
  sourceStatus: 'taxonomy_only' | 'regulatory_and_literature';
  lastEvidenceCheck: string | null;
  lastEvidenceUpdate: string | null;
};

// This controlled vocabulary enables deterministic search and canonical URLs.
// It does not contain a clinical description, therapeutic recommendation, or an
// AEMPS indication assertion until a traceable official indication source exists.
export const indications: readonly ClinicalIndication[] = [
  { id: 'otitis-externa', slug: 'otitis-externa', names: { es: 'Otitis externa', en: 'Otitis externa', fr: 'Otite externe' }, aliases: ['otitis externa', 'external otitis', 'otite externe'], species: ['Perro', 'Gato'], indexable: false, sourceStatus: 'taxonomy_only', lastEvidenceCheck: null, lastEvidenceUpdate: null },
] as const;

export function findIndication(slug: string) { return indications.find(indication => indication.slug === slug); }

export type RecommendationWorkflowState = 'draft' | 'review_required' | 'reviewed' | 'approved' | 'published' | 'updated' | 'retired';
export type ReviewedRecommendation = {
  id: string; indicationId: string; species: 'Perro' | 'Gato'; context: string; activeIngredient: string; route: string;
  doseRange?: { minimum: string; maximum: string; unit: string }; sourceUrl: string; sourceTitle: string; publicationYear: number;
  reviewer: string; reviewedAt: string; version: string; status: RecommendationWorkflowState; notes?: string;
};

// Empty by design. Literature import must never populate this collection.
export const reviewedRecommendations: readonly ReviewedRecommendation[] = [];

import release from './generated/aemps-public.json';

export type RegulatoryIngredient = { activeId: string; name: string; amount: string; unit: string };
export type RegulatoryPresentation = { nationalCode: string; label: string; packageContent: string; packageContentUnit: string };
export type RegulatoryProduct = {
  slug: string; registrationNumber: string; name: string; atcvet: string[];
  firstAuthorizationDate: string; marketingStatus: 'SI' | 'NO'; prescriptionRequired: 'SI' | 'NO';
  veterinaryExclusiveAdministration: 'SI' | 'NO'; veterinarianControlAdministration: 'SI' | 'NO';
  technicalSheetUrl: string; leafletUrl: string; species: string[]; routes: string[];
  activeSubstances: string[]; ingredients: RegulatoryIngredient[]; presentations: RegulatoryPresentation[];
};
export type RegulatoryCalculatorPresentation = {
  id: string; product: string; label: string; nationalCode: string; concentration: string;
  concentrationUnit: 'mg/mL' | 'µg/mL'; species: string[]; routes: string[]; sourceUrl: string;
};
export type RegulatoryCalculatorProduct = { slug: string; name: string; presentations: RegulatoryCalculatorPresentation[] };
export type RegulatoryRelease = {
  schemaVersion: number;
  release: {
    sourceId: string; publisher: string; sourceUrl: string; documentationUrl: string; legalNoticeUrl: string;
    retrievedAt: string; sourceDataDate: string; archiveSha256: string; approvedAt: string;
    approvalScope: 'REGULATORY_DATA_ONLY'; reviewer: string; filters: string[];
    counts: { sourceProducts: number; authorizedProducts: number; publishedProducts: number; publishedPresentations: number; excludedUnresolvedProducts: number };
    excludedUnresolvedRegistrationNumbers: string[];
  };
  products: RegulatoryProduct[];
};

export const regulatoryRelease = release as RegulatoryRelease;
export const regulatoryProducts = regulatoryRelease.products;
export function findRegulatoryProduct(slug: string) { return regulatoryProducts.find(product => product.slug === slug); }

function concentrationInOfficialName(name: string): { concentration: string; concentrationUnit: 'mg/mL' | 'µg/mL' } | null {
  // The AEMPS product name is used only when it explicitly states a mass/volume
  // concentration. No dose, indication, or concentration is inferred from packaging.
  const match = name.match(/(?:^|\s)(\d+(?:[.,]\d+)?)\s*(mg|µg|ug)\s*\/\s*m[lL](?:\s|$)/i);
  if (!match) return null;
  return { concentration: match[1].replace(',', '.'), concentrationUnit: match[2].toLowerCase() === 'mg' ? 'mg/mL' : 'µg/mL' };
}

export function toRegulatoryCalculatorProduct(product: RegulatoryProduct): RegulatoryCalculatorProduct {
  const concentration = product.activeSubstances.length === 1 ? concentrationInOfficialName(product.name) : null;
  return {
    slug: product.slug,
    name: product.name,
    presentations: concentration ? product.presentations.map(presentation => ({
      id: `${product.registrationNumber}:${presentation.nationalCode}`,
      product: product.name,
      label: presentation.label,
      nationalCode: presentation.nationalCode,
      concentration: concentration.concentration,
      concentrationUnit: concentration.concentrationUnit,
      species: product.species,
      routes: product.routes,
      sourceUrl: product.technicalSheetUrl,
    })) : [],
  };
}

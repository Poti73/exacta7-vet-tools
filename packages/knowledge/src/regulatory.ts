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

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const input = resolve(process.argv[2] ?? 'data/aemps/staging/aemps-nomenclator-2026-09-16.json');
const output = resolve(process.argv[3] ?? 'packages/knowledge/src/generated/aemps-public.json');
const searchOutput = resolve(process.argv[4] ?? 'packages/knowledge/src/generated/aemps-search.json');

const raw = await readFile(input, 'utf8');
const staging = JSON.parse(raw);
const unresolved = value => Array.isArray(value) && value.some(item => String(item).startsWith('UNRESOLVED_AEMPS_'));
const slugify = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100);

const eligible = staging.data.products.filter(product =>
  product.registration_status_code === '1'
  && !unresolved(product.active_substances)
  && !unresolved(product.target_species)
  && !unresolved(product.routes)
);
const eligibleIds = new Set(eligible.map(product => product.id));
const presentationsByProduct = new Map();
for (const presentation of staging.data.presentations) {
  if (!eligibleIds.has(presentation.product_id) || presentation.presentation_registration_status_code !== '1') continue;
  const list = presentationsByProduct.get(presentation.product_id) ?? [];
  list.push({
    nationalCode: presentation.aemps_national_code,
    label: presentation.label,
    packageContent: presentation.package_content,
    packageContentUnit: presentation.package_content_unit,
  });
  presentationsByProduct.set(presentation.product_id, list);
}

const products = eligible.map(product => ({
  slug: `${slugify(product.name)}-${slugify(product.aemps_registration_number)}`,
  registrationNumber: product.aemps_registration_number,
  name: product.name,
  atcvet: product.atcvet,
  firstAuthorizationDate: product.first_authorization_date,
  marketingStatus: product.marketing_status,
  prescriptionRequired: product.prescription_required,
  veterinaryExclusiveAdministration: product.veterinary_exclusive_administration,
  veterinarianControlAdministration: product.veterinarian_control_administration,
  technicalSheetUrl: product.technical_sheet_url,
  leafletUrl: product.leaflet_url,
  species: product.target_species,
  routes: product.routes,
  activeSubstances: product.active_substances,
  ingredients: product.ingredients.map(ingredient => ({
    activeId: ingredient.aemps_active_id,
    name: ingredient.name,
    amount: ingredient.amount,
    unit: ingredient.unit,
  })),
  presentations: presentationsByProduct.get(product.id) ?? [],
})).sort((a, b) => a.name.localeCompare(b.name, 'es'));

const excludedUnresolved = staging.data.products.filter(product =>
  product.registration_status_code === '1'
  && (unresolved(product.active_substances) || unresolved(product.target_species) || unresolved(product.routes))
).map(product => product.aemps_registration_number);
const authorizedCount = staging.data.products.filter(product => product.registration_status_code === '1').length;
const publicPresentationCount = products.reduce((total, product) => total + product.presentations.length, 0);
const payload = {
  schemaVersion: 1,
  release: {
    sourceId: staging.source.id,
    publisher: staging.source.publisher,
    sourceUrl: staging.source.source_url,
    documentationUrl: staging.source.documentation_url,
    legalNoticeUrl: staging.source.legal_notice_url,
    retrievedAt: staging.source.retrieved_at,
    sourceDataDate: staging.source.source_data_date,
    archiveSha256: staging.source.archive_sha256,
    approvedAt: new Date().toISOString().slice(0, 10),
    approvalScope: 'REGULATORY_DATA_ONLY',
    reviewer: 'Exacta7 editorial approval (user-authorized)',
    filters: ['registration_status_code=1', 'presentation_registration_status_code=1', 'no unresolved AEMPS identifiers'],
    counts: {
      sourceProducts: staging.counts.products,
      authorizedProducts: authorizedCount,
      publishedProducts: products.length,
      publishedPresentations: publicPresentationCount,
      excludedUnresolvedProducts: excludedUnresolved.length,
    },
    excludedUnresolvedRegistrationNumbers: excludedUnresolved,
  },
  products,
};

const serialized = `${JSON.stringify(payload)}\n`;
await mkdir(dirname(output), { recursive: true });
await writeFile(output, serialized, 'utf8');
const searchPayload = products.map(({ slug, name, registrationNumber, activeSubstances, species, routes, atcvet, marketingStatus }) => ({
  slug, name, registrationNumber, activeSubstances, species, routes, atcvet, marketingStatus,
}));
const serializedSearch = `${JSON.stringify(searchPayload)}\n`;
await writeFile(searchOutput, serializedSearch, 'utf8');
console.log(JSON.stringify({
  output,
  bytes: Buffer.byteLength(serialized),
  searchOutput,
  searchBytes: Buffer.byteLength(serializedSearch),
  sha256: createHash('sha256').update(serialized).digest('hex'),
  ...payload.release.counts,
  excludedUnresolved,
}, null, 2));

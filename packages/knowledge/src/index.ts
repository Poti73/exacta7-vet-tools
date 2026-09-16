export type ReviewState = 'DRAFT' | 'IMPORTED' | 'PENDING_REVIEW' | 'REVIEWED' | 'PUBLISHED' | 'ARCHIVED';
export type Source = { id: string; title: string; url: string; kind: 'regulatory' | 'guideline' | 'literature' | 'secondary'; retrievedAt: string; version: string; license: string };
export type Publication = { state: ReviewState; reviewer?: string; reviewedAt?: string; version: string; sourceId: string };
export type Presentation = {
  id: string; substanceId: string; product: string; label: string; registration: string;
  concentration: string; concentrationUnit: 'mg/mL' | 'µg/mL'; species: string[]; routes: string[];
  source: Source; publication: Publication;
};
export type Recommendation = {
  id: string; substanceId: string; indication: string; species: string[]; route: string;
  kind: 'dose' | 'cri'; minimum: string; maximum: string;
  unit: 'mg/kg' | 'µg/kg' | 'mg/kg/h' | 'µg/kg/min'; context: string;
  source: Source; publication: Publication;
};
export type Substance = { id: string; slug: string; name: string; aliases: string[]; categories: string[]; publication?: Publication; source?: Source };
export type Group = 'MEDICAMENTOS' | 'CALCULADORAS' | 'HERRAMIENTAS' | 'REFERENCIAS';
export type SearchEntry = {
  id: string; group: Group; title: string; description: string; href: string; terms: string[];
  species: string[]; routes: string[]; indications: string[]; categories: string[];
  substanceSlug?: string; source?: Source; publication?: Publication;
  navigationOnly?: boolean;
};
import aempsSearch from './generated/aemps-search.json';
type AempsSearchRecord = { slug: string; name: string; registrationNumber: string; activeSubstances: string[]; species: string[]; routes: string[]; atcvet: string[]; marketingStatus: string };
export const groups: Group[] = ['MEDICAMENTOS', 'CALCULADORAS', 'HERRAMIENTAS', 'REFERENCIAS'];
export function isPublished(publication: Publication | undefined, source: Source | undefined): boolean {
  return !!publication && publication.state === 'PUBLISHED' && !!publication.reviewer?.trim()
    && !!publication.reviewedAt && Number.isFinite(Date.parse(publication.reviewedAt))
    && !!publication.version && !!source && publication.sourceId === source.id
    && /^https:\/\//.test(source.url) && !!source.version && !!source.license;
}
export const sources: Source[] = [
  { id: 'aemps', title: 'AEMPS · CIMA Vet', kind: 'regulatory', url: 'https://sede.aemps.gob.es/datos-abiertos/', retrievedAt: '2026-09-16', version: 'Nomenclátor CIMA Vet 2026-09-16', license: 'Reutilización con atribución conforme al portal de datos abiertos de AEMPS' },
  { id: 'aaha', title: 'AAHA · Anestesia y monitorización 2020', kind: 'guideline', url: 'https://www.aaha.org/resources/2020-aaha-anesthesia-and-monitoring-guidelines-for-dogs-and-cats/', retrievedAt: '2026-09-16', version: '2020', license: 'Enlace únicamente; sin reproducción de contenido' },
  { id: 'wsava', title: 'WSAVA · Guías de dolor', kind: 'guideline', url: 'https://wsava.org/global-guidelines/pain-guidelines/', retrievedAt: '2026-09-16', version: 'portal', license: 'Enlace únicamente; sin reproducción de contenido' },
  { id: 'msd', title: 'MSD Veterinary Manual', kind: 'secondary', url: 'https://www.msdvetmanual.com/', retrievedAt: '2026-09-16', version: 'portal', license: 'Referencia secundaria y seguimiento bibliográfico; sin extracción' },
];
// This is a navigation shell requested by the user, not a published clinical monograph.
export const substances: Substance[] = [{ id: 'propofol', slug: 'propofol', name: 'Propofol', aliases: [], categories: [] }];
export const presentations: Presentation[] = [];
export const recommendations: Recommendation[] = [];
const navigation = (id: string, group: Group, title: string, description: string, href: string, terms: string[]): SearchEntry => ({ id, group, title, description, href, terms: [...terms], species: [], routes: [], indications: [], categories: [], navigationOnly: true });
export function buildIndex(drugs: Substance[], products: Presentation[], guidance: Recommendation[]): SearchEntry[] {
  const output: SearchEntry[] = drugs.filter(d => !d.publication || isPublished(d.publication, d.source)).map(d => ({
    ...navigation(d.id, 'MEDICAMENTOS', d.name, d.publication ? 'Ficha del medicamento · consultar fuentes' : 'Ficha en preparación · sin datos clínicos publicados', `/medicamentos/${d.slug}`, d.aliases),
    categories: d.publication ? d.categories : [], substanceSlug: d.slug, publication: d.publication, source: d.source, navigationOnly: !d.publication,
  }));
  for (const p of products.filter(p => p.source.kind === 'regulatory' && isPublished(p.publication, p.source))) {
    const drug = drugs.find(d => d.id === p.substanceId);
    if (!drug || !output.some(e => e.id === drug.id)) continue;
    output.push({ id: p.id, group: 'MEDICAMENTOS', title: `${p.product} · ${p.label}`, description: 'Presentación AEMPS/CIMA Vet · verificar ficha técnica', href: `/medicamentos/${drug.slug}#presentaciones`, terms: [drug.name, p.registration, p.concentration, p.concentrationUnit, ...drug.aliases], species: p.species, routes: p.routes, indications: [], categories: [], substanceSlug: drug.slug, publication: p.publication, source: p.source });
  }
  for (const r of guidance.filter(r => ['guideline', 'literature'].includes(r.source.kind) && isPublished(r.publication, r.source))) {
    const drug = drugs.find(d => d.id === r.substanceId);
    if (!drug || !output.some(e => e.id === drug.id)) continue;
    const entry = output.find(e => e.id === drug.id)!;
    entry.terms.push(r.indication, r.kind === 'cri' ? 'CRI infusión continua' : 'dosis');
    entry.species.push(...r.species); entry.routes.push(r.route); entry.indications.push(r.indication);
    output.push({ id: r.id, group: 'CALCULADORAS', title: `${r.kind === 'cri' ? 'CRI' : 'Dosis'} · ${drug.name}`, description: 'Rangos publicados en la ficha · selección profesional', href: `/calculadoras/${r.kind}?medicamento=${drug.slug}`, terms: [drug.name, r.indication, r.context], species: r.species, routes: [r.route], indications: [r.indication], categories: [], substanceSlug: drug.slug, publication: r.publication, source: r.source });
    output.push({ ...navigation(`source-${r.id}`, 'REFERENCIAS', r.source.title, 'Fuente de la recomendación publicada', r.source.url, [drug.name, r.kind, r.indication]), source: r.source });
  }
  return output;
}
export const catalog: SearchEntry[] = [
  ...buildIndex(substances, presentations, recommendations),
  ...(aempsSearch as AempsSearchRecord[]).map(product => ({
    id: `aemps-${product.registrationNumber}`,
    group: 'MEDICAMENTOS' as const,
    title: product.name,
    description: `Producto AEMPS/CIMA Vet · registro ${product.registrationNumber}`,
    href: `/medicamentos/${product.slug}`,
    terms: [product.registrationNumber, ...product.activeSubstances, ...product.atcvet],
    species: product.species,
    routes: product.routes,
    indications: [],
    categories: product.atcvet,
    source: sources[0],
  })),
  navigation('dose', 'CALCULADORAS', 'Dosis y volumen', 'Conversión matemática de una dosis seleccionada por el profesional.', '/calculadoras/dose', ['dosis', 'peso', 'concentración', 'mg kg', 'volumen', 'perro', 'gato']),
  navigation('cri', 'CALCULADORAS', 'Infusión continua · CRI', 'Convierte la tasa introducida en un caudal de infusión.', '/calculadoras/cri', ['CRI', 'infusión', 'continua', 'bomba', 'mg/kg/h', 'µg/kg/min', 'perro', 'gato']),
  navigation('fluid', 'CALCULADORAS', 'Fluidoterapia', 'Calcula mL/h a partir de la tasa elegida por el profesional.', '/calculadoras/fluidos', ['fluidoterapia', 'fluidos', 'ml kg h', 'perro', 'gato']),
  navigation('patient', 'HERRAMIENTAS', 'Paciente actual', 'Define especie y peso para tus herramientas de cálculo.', '/paciente', ['paciente', 'peso', 'especie', 'perro', 'gato', 'kg']),
  navigation('method', 'HERRAMIENTAS', 'Fuentes y metodología', 'Cómo se separan y revisan los datos de Exacta7.', '/fuentes', ['fuentes', 'evidencia', 'revisión', 'bibliografía', 'regulatorio']),
  ...sources.map(s => ({ ...navigation(s.id, 'REFERENCIAS', s.title, s.kind === 'secondary' ? 'Enlace secundario · seguimiento bibliográfico' : 'Consultar la fuente original', s.url, s.id === 'aaha' ? ['anestesia', 'monitorización', 'perro', 'gato', 'guideline'] : s.id === 'wsava' ? ['dolor', 'analgesia', 'guideline'] : s.id === 'aemps' ? ['productos', 'comercial', 'ficha técnica', 'presentaciones', 'veterinaria'] : ['MSD', 'Merck', 'bibliografía']), source: s })),
];
export { createSearch, normalize } from './search';


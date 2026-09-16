import { describe, expect, it } from 'vitest';
import { buildIndex, catalog, createSearch, isPublished, type Source, type Publication, type Substance, type Presentation, type Recommendation } from '../../packages/knowledge/src/index';
// Synthetic fixtures only. Never bundled in the public application.
const source: Source = { id: 'test-source', title: 'Fuente sintética', url: 'https://example.test/source', kind: 'regulatory', retrievedAt: '2026-09-16', version: 'test', license: 'TEST ONLY' };
const publication: Publication = { state: 'PUBLISHED', reviewer: 'TEST REVIEWER', reviewedAt: '2026-09-16', version: 'test', sourceId: source.id };
const drug: Substance = { id: 'test', slug: 'sustancia-prueba', name: 'Sustancia Prueba', aliases: ['ActivoPrueba'], categories: ['Categoría sintética'], publication, source };
const product: Presentation = { id: 'product', substanceId: drug.id, product: 'MarcaPrueba', label: 'Vial sintético 20 mL', registration: 'TEST-01', concentration: '10', concentrationUnit: 'mg/mL', species: ['Perro'], routes: ['IV', 'intravenosa'], source, publication };
const guidance: Recommendation = { id: 'recommendation', substanceId: drug.id, indication: 'Indicación sintética', species: ['Perro'], route: 'IV', kind: 'cri', minimum: '1', maximum: '2', unit: 'mg/kg/h', context: 'Contexto de prueba', source: { ...source, kind: 'literature' }, publication };
const search = createSearch(buildIndex([drug], [product], [guidance]));
describe('búsqueda determinista estructurada', () => {
  it.each(['MarcaPrueba', 'ActivoPrueba', 'vial', '20 ml', 'perro intravenosa', 'categoria sintetica', 'indicacion sintetica', 'TEST-01'])('encuentra %s', query => expect(search(query).length).toBeGreaterThan(0));
  it('agrupa CRI en calculadoras, medicamento y fuente', () => { expect(new Set(search('CRI').map(e => e.group))).toEqual(new Set(['CALCULADORAS', 'MEDICAMENTOS', 'REFERENCIAS'])); });
  it('tolera un error o transposición, etiquetándolo', () => { expect(createSearch(catalog)('propfol')[0]).toMatchObject({ title: 'Propofol', approximate: true }); expect(createSearch(catalog)('proopfol')[0].approximate).toBe(true); });
  it('no aproxima consultas cortas', () => expect(search('CRJ')).toEqual([]));
  it('normaliza acentos y busca incrementalmente', () => { expect(search('categoria')).toEqual(search('categoría')); expect(search('sustan')[0].title).toBe('Sustancia Prueba'); });
  it('no ignora palabras sin coincidencia', () => expect(search('MarcaPrueba inexistente')).toEqual([]));
  it('maneja entrada vacía, puntuación y filtros', () => { expect(search('')).toEqual([]); expect(search('---')).toEqual([]); expect(search('CRI', 'HERRAMIENTAS')).toEqual([]); });
  it('no incluye dosis ni órdenes de administración en resúmenes', () => { for (const result of search('CRI')) { expect(result.description).not.toMatch(/administre|mg\/kg|1–2/i); } });
  it('da resultados estables', () => expect(search('CRI')).toEqual(search('CRI')));
  it('tiene coste acotado para el catálogo MVP', () => { const expanded = Array.from({length:100},(_,i)=>catalog.map(e=>({...e,id:`${i}-${e.id}`}))).flat(); const query = createSearch(expanded); const start = performance.now(); for(let i=0;i<20;i++)query('propfol'); expect(performance.now()-start).toBeLessThan(2000); });
});
describe('barrera de publicación', () => {
  it.each(['DRAFT','IMPORTED','PENDING_REVIEW','REVIEWED','ARCHIVED'] as const)('excluye %s', state => {
    const draft = {...publication, state};
    expect(buildIndex([{...drug,publication:draft}], [product], [guidance])).toEqual([]);
    const index = buildIndex([drug], [{...product,publication:draft}], [{...guidance,publication:draft}]);
    expect(index).toHaveLength(1); expect(createSearch(index)('MarcaPrueba')).toEqual([]); expect(createSearch(index)('CRI')).toEqual([]);
  });
  it('exige reviewer, fecha y fuente coincidente', () => {
    expect(isPublished({...publication,reviewer:''},source)).toBe(false);
    expect(isPublished({...publication,reviewedAt:'invalid'},source)).toBe(false);
    expect(isPublished({...publication,sourceId:'other'},source)).toBe(false);
  });
  it('no acepta MSD como origen de recomendaciones o presentaciones', () => {
    expect(buildIndex([drug],[{...product,source:{...source,kind:'secondary'}}],[{...guidance,source:{...source,kind:'secondary'}}])).toHaveLength(1);
  });
  it('no publica rangos clínicos desde una ficha regulatoria', () => expect(buildIndex([drug],[],[{...guidance,source}])).toHaveLength(1));
  it('no publica categorías no revisadas de fichas vacías', () => { const entries = buildIndex([{...drug,publication:undefined}],[],[]); expect(entries[0].categories).toEqual([]); });
});

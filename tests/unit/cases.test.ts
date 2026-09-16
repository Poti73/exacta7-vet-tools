import { describe, expect, it } from 'vitest';
import { ACTIVE_CASE_EXPIRY_MS, expireCases, isStale, parseCaseStore, type ClinicalCase } from '../../apps/web/components/patient-context';

const start = new Date('2026-09-16T08:00:00.000Z').getTime();
const createCase = (id: string, weight: string, last = start): ClinicalCase => ({ case_id: id, alias: `Caso ${id}`, species: id === 'a' ? 'Perro' : 'Gato', weight, asa: id === 'a' ? 'II' : 'III', created_at: new Date(start).toISOString(), last_activity_at: new Date(last).toISOString(), status: 'ACTIVE' });

describe('casos activos: seguridad de aislamiento', () => {
  it('mantiene estados y cálculos asociados exclusivamente al case_id', () => {
    const store = parseCaseStore(JSON.stringify({ version: 1, active_case_id: 'a', cases: [
      { case: createCase('a', '18.4'), tools: { 'dose:propofol': { concentration: '0.2', result: '9.2' } }, calculations: [{ calculation_id: 'calc-a', case_id: 'a', tool_type: 'dose', created_at: new Date(start).toISOString(), result: { volume: '9.2' } }] },
      { case: createCase('b', '4.7'), tools: { 'cri:general': { rate: '2' } }, calculations: [{ calculation_id: 'calc-b', case_id: 'b', tool_type: 'cri', created_at: new Date(start).toISOString(), result: { volume: '0.3' } }] },
    ] }));
    const a = store.cases.find(item => item.case.case_id === 'a')!; const b = store.cases.find(item => item.case.case_id === 'b')!;
    expect(a.case.weight).toBe('18.4'); expect(b.case.weight).toBe('4.7');
    expect(a.tools['dose:propofol']).toEqual({ concentration: '0.2', result: '9.2' }); expect(b.tools['dose:propofol']).toBeUndefined();
    expect(a.calculations.every(item => item.case_id === 'a')).toBe(true); expect(b.calculations.every(item => item.case_id === 'b')).toBe(true);
  });
  it('invalida un active_case_id no existente y cálculos de otro caso', () => {
    const parsed = parseCaseStore(JSON.stringify({ version: 1, active_case_id: 'missing', cases: [{ case: createCase('a', '18.4'), tools: {}, calculations: [{ calculation_id: 'bad', case_id: 'b' }] }] }));
    expect(parsed.active_case_id).toBeNull(); expect(parsed.cases[0].calculations).toEqual([]);
  });
  it('expira a las 12 horas y retira el caso activo', () => {
    const store = parseCaseStore(JSON.stringify({ version: 1, active_case_id: 'a', cases: [{ case: createCase('a', '18.4'), tools: {}, calculations: [] }] }));
    const expired = expireCases(store, start + ACTIVE_CASE_EXPIRY_MS);
    expect(expired.cases[0].case.status).toBe('EXPIRED'); expect(expired.active_case_id).toBeNull();
  });
  it('avisa a partir de las ocho horas, sin expirar antes de doce', () => {
    const item = createCase('a', '18.4', start); expect(isStale(item, start + 8 * 3_600_000)).toBe(true);
    const store = parseCaseStore(JSON.stringify({ version: 1, active_case_id: 'a', cases: [{ case: item, tools: {}, calculations: [] }] }));
    expect(expireCases(store, start + 11 * 3_600_000).cases[0].case.status).toBe('ACTIVE');
  });
  it('rechaza case_id y peso inválidos', () => {
    expect(parseCaseStore(JSON.stringify({ version: 1, active_case_id: 'a', cases: [{ case: { ...createCase('a', '18.4'), case_id: '', weight: '-1' }, tools: {}, calculations: [] }] })).cases).toEqual([]);
  });
});

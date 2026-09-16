'use client';

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { positive } from '@exacta7/clinical-core';

export type CaseStatus = 'ACTIVE' | 'FINISHED' | 'SAVED' | 'EXPIRED';
export type ClinicalCase = {
  case_id: string; alias?: string; species: 'Perro' | 'Gato'; weight: string; age?: string;
  asa: 'I' | 'II' | 'III' | 'IV' | 'V'; sex?: 'Macho' | 'Hembra'; reproductive_status?: string;
  created_at: string; last_activity_at: string; status: CaseStatus;
};
export type CaseInput = Omit<ClinicalCase, 'case_id' | 'created_at' | 'last_activity_at' | 'status'>;
export type StoredCalculation = { calculation_id: string; case_id: string; tool_type: string; created_at: string; result: unknown };
type CaseRecord = { case: ClinicalCase; tools: Record<string, unknown>; calculations: StoredCalculation[] };
type CaseStore = { version: 1; active_case_id: string | null; cases: CaseRecord[] };

const KEY = 'exacta7.active-cases.v1';
export const ACTIVE_CASE_EXPIRY_MS = 12 * 60 * 60 * 1000;
export const STALE_CASE_WARNING_MS = 8 * 60 * 60 * 1000;
let memory: string | null = null;
let storageFailed = false;
const emptyStore = (): CaseStore => ({ version: 1, active_case_id: null, cases: [] });
const now = () => new Date().toISOString();
function emit() { window.dispatchEvent(new Event('exacta7:cases')); }
function snapshot() { try { return storageFailed ? memory : localStorage.getItem(KEY); } catch { return memory; } }
function subscribe(listener: () => void) { window.addEventListener('exacta7:cases', listener); window.addEventListener('storage', listener); return () => { window.removeEventListener('exacta7:cases', listener); window.removeEventListener('storage', listener); }; }
function validCase(value: unknown): value is ClinicalCase {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<ClinicalCase>;
  try { return typeof item.case_id === 'string' && !!item.case_id && ['Perro', 'Gato'].includes(item.species ?? '') && ['I', 'II', 'III', 'IV', 'V'].includes(item.asa ?? '') && ['ACTIVE', 'FINISHED', 'SAVED', 'EXPIRED'].includes(item.status ?? '') && !!item.created_at && !!item.last_activity_at && !!positive(item.weight ?? '', 'Peso'); } catch { return false; }
}
export function parseCaseStore(raw: string | null): CaseStore {
  if (!raw) return emptyStore();
  try {
    const value = JSON.parse(raw) as CaseStore;
    if (value.version !== 1 || !Array.isArray(value.cases)) return emptyStore();
    const cases = value.cases.filter(record => validCase(record.case)).map(record => ({ ...record, tools: record.tools && typeof record.tools === 'object' ? record.tools : {}, calculations: Array.isArray(record.calculations) ? record.calculations.filter(c => c.case_id === record.case.case_id) : [] }));
    return { version: 1, active_case_id: cases.some(record => record.case.case_id === value.active_case_id) ? value.active_case_id : null, cases };
  } catch { return emptyStore(); }
}
export function expireCases(store: CaseStore, at = Date.now()): CaseStore {
  const cases = store.cases.map(record => record.case.status === 'ACTIVE' && at - Date.parse(record.case.last_activity_at) >= ACTIVE_CASE_EXPIRY_MS ? { ...record, case: { ...record.case, status: 'EXPIRED' as const } } : record);
  const active = cases.some(record => record.case.case_id === store.active_case_id && record.case.status === 'ACTIVE') ? store.active_case_id : null;
  return { ...store, active_case_id: active, cases };
}
function saveStore(store: CaseStore) { const raw = JSON.stringify(store); memory = raw; try { localStorage.setItem(KEY, raw); } catch { storageFailed = true; } emit(); }
function initialStore(raw: string | null): CaseStore { return expireCases(parseCaseStore(raw)); }
function newId() { return crypto.randomUUID(); }

type CaseContextValue = {
  store: CaseStore; activeCase: ClinicalCase | null; persistent: boolean;
  createCase: (input: CaseInput) => ClinicalCase; updateCase: (caseId: string, input: CaseInput) => void;
  activateCase: (caseId: string) => boolean; reactivateCase: (caseId: string) => boolean; finishCase: (caseId: string) => void; touchCase: (caseId: string) => void;
  getToolState: <T,>(caseId: string, tool: string) => T | null; saveToolState: (caseId: string, tool: string, state: unknown) => void; saveCalculation: (calculation: StoredCalculation) => void;
};
const CaseContext = createContext<CaseContextValue | null>(null);

export function PatientProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  const store = useMemo(() => initialStore(raw), [raw]);
  useEffect(() => {
    const parsed = parseCaseStore(raw);
    const needsPersist = parsed.cases.some((record, index) => record.case.status !== store.cases[index]?.case.status) || parsed.active_case_id !== store.active_case_id;
    if (needsPersist) saveStore(store);
  }, [raw, store]);
  const activeCase = store.cases.find(record => record.case.case_id === store.active_case_id)?.case ?? null;
  const mutate = (fn: (draft: CaseStore) => CaseStore) => saveStore(expireCases(fn(initialStore(snapshot()))));
  const createCase = (input: CaseInput) => {
    const created: ClinicalCase = { ...input, alias: input.alias?.trim() || undefined, weight: positive(input.weight, 'Peso').toString(), case_id: newId(), created_at: now(), last_activity_at: now(), status: 'ACTIVE' };
    mutate(draft => ({ ...draft, active_case_id: created.case_id, cases: [...draft.cases, { case: created, tools: {}, calculations: [] }] })); return created;
  };
  const updateCase = (caseId: string, input: CaseInput) => mutate(draft => ({ ...draft, cases: draft.cases.map(record => record.case.case_id === caseId ? { ...record, case: { ...record.case, ...input, alias: input.alias?.trim() || undefined, weight: positive(input.weight, 'Peso').toString(), last_activity_at: now() } } : record) }));
  const activateCase = (caseId: string) => { const candidate = initialStore(snapshot()).cases.find(record => record.case.case_id === caseId)?.case; if (!candidate || candidate.status !== 'ACTIVE') return false; mutate(draft => ({ ...draft, active_case_id: caseId, cases: draft.cases.map(record => record.case.case_id === caseId ? { ...record, case: { ...record.case, last_activity_at: now() } } : record) })); return true; };
  const reactivateCase = (caseId: string) => { const candidate = initialStore(snapshot()).cases.find(record => record.case.case_id === caseId)?.case; if (!candidate || candidate.status !== 'EXPIRED') return false; mutate(draft => ({ ...draft, active_case_id: caseId, cases: draft.cases.map(record => record.case.case_id === caseId ? { ...record, case: { ...record.case, status: 'ACTIVE', last_activity_at: now() } } : record) })); return true; };
  const finishCase = (caseId: string) => mutate(draft => ({ ...draft, active_case_id: draft.active_case_id === caseId ? null : draft.active_case_id, cases: draft.cases.filter(record => record.case.case_id !== caseId) }));
  const touchCase = (caseId: string) => mutate(draft => ({ ...draft, cases: draft.cases.map(record => record.case.case_id === caseId && record.case.status === 'ACTIVE' ? { ...record, case: { ...record.case, last_activity_at: now() } } : record) }));
  const getToolState = <T,>(caseId: string, tool: string): T | null => store.cases.find(record => record.case.case_id === caseId)?.tools[tool] as T ?? null;
  const saveToolState = (caseId: string, tool: string, state: unknown) => mutate(draft => ({ ...draft, cases: draft.cases.map(record => record.case.case_id === caseId && record.case.status === 'ACTIVE' ? { ...record, tools: { ...record.tools, [tool]: state }, case: { ...record.case, last_activity_at: now() } } : record) }));
  const saveCalculation = (calculation: StoredCalculation) => mutate(draft => ({ ...draft, cases: draft.cases.map(record => record.case.case_id === calculation.case_id && record.case.status === 'ACTIVE' ? { ...record, calculations: [...record.calculations.filter(item => item.calculation_id !== calculation.calculation_id), calculation], case: { ...record.case, last_activity_at: now() } } : record) }));
  return <CaseContext.Provider value={{ store, activeCase, persistent: !storageFailed, createCase, updateCase, activateCase, reactivateCase, finishCase, touchCase, getToolState, saveToolState, saveCalculation }}>{children}</CaseContext.Provider>;
}
export function usePatient() { const context = useContext(CaseContext); if (!context) throw new Error('PatientProvider is required.'); return context; }
export const caseLabel = (item: ClinicalCase) => item.alias || `Caso ${item.case_id.slice(0, 4).toUpperCase()}`;
export const caseSummary = (item: ClinicalCase) => `${item.species} · ${item.weight} kg · ASA ${item.asa}`;
export const isStale = (item: ClinicalCase, at = Date.now()) => at - Date.parse(item.last_activity_at) >= STALE_CASE_WARNING_MS;

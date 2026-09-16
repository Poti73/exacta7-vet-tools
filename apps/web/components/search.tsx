'use client';
import { useEffect, useMemo, useRef, useState, useId, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { catalog, createSearch, groups, type Group } from '@exacta7/knowledge';
import { caseLabel, usePatient } from './patient-context';
import { useI18n } from './i18n';
const search = createSearch(catalog);
export function ClinicalSearch({ compact = false, medicationOnly = false }: { compact?: boolean; medicationOnly?: boolean }) {
  const { t } = useI18n();
  const id = useId(); const input = useRef<HTMLInputElement>(null); const area = useRef<HTMLDivElement>(null);
  const { activeCase } = usePatient(); const [query, setQuery] = useState(''); const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<Group | undefined>(medicationOnly ? 'MEDICAMENTOS' : undefined);
  const hits = useMemo(() => search(query, filter), [query, filter]);
  useEffect(() => {
    if (!compact) return;
    const shortcut = (e: globalThis.KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); input.current?.focus(); setOpen(true); } };
    const outside = (e: PointerEvent) => { if (e.target instanceof Node && !area.current?.contains(e.target)) setOpen(false); };
    window.addEventListener('keydown', shortcut); document.addEventListener('pointerdown', outside);
    return () => { window.removeEventListener('keydown', shortcut); document.removeEventListener('pointerdown', outside); };
  }, [compact]);
  function keys(e: KeyboardEvent) {
    if (e.key === 'Escape') { setOpen(false); input.current?.focus(); return; }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const links = Array.from(area.current?.querySelectorAll<HTMLAnchorElement>('[data-result]') ?? []);
    if (!links.length) return;
    e.preventDefault(); const current = links.indexOf(document.activeElement as HTMLAnchorElement);
    const next = e.key === 'ArrowDown' ? (current + 1) % links.length : current <= 0 ? links.length - 1 : current - 1;
    links[next].focus();
  }
  const show = !compact || open;
  return <div ref={area} className={compact ? 'global-search' : 'search-workspace'} onKeyDown={keys} onBlur={e => { if (compact && !e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}>
    <form role="search" aria-label={compact ? t('globalSearch') : t('clinicalSearch')} onSubmit={e => { e.preventDefault(); setOpen(true); }}>
      <label className="sr-only" htmlFor={id}>{compact ? t('searchExacta') : t('searchLong')}</label>
      <div className="search-input"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><input id={id} ref={input} type="search" value={query} maxLength={120} autoComplete="off" placeholder={compact ? `${t('searchExacta')}…` : t('searchPlaceholder')} onChange={e => { setQuery(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} aria-controls={`${id}-results`} /><kbd>{compact ? 'Ctrl K' : '↵'}</kbd></div>
    </form>
    {show && <div className={compact ? 'search-popover' : ''} id={`${id}-results`}>
      {!compact && !medicationOnly && <div className="filter-tabs" aria-label={t('all')}><button type="button" aria-pressed={!filter} onClick={() => setFilter(undefined)}>{t('all')}</button>{groups.map(group => <button type="button" aria-pressed={filter === group} key={group} onClick={() => setFilter(group)}>{t(group === 'MEDICAMENTOS' ? 'groupMedicines' : group === 'CALCULADORAS' ? 'groupCalculators' : group === 'HERRAMIENTAS' ? 'groupTools' : 'groupReferences')}</button>)}</div>}
      {!query.trim() ? <div className="search-idle"><span className="eyebrow">{compact ? t('searchContext') : t('explore')}</span><p>{t('searchHelp')}</p><div className="suggestions">{['Propofol', 'CRI', 'Perro', 'AEMPS'].map(q => <button type="button" key={q} onClick={() => { setQuery(q); input.current?.focus(); }}>{q} <span aria-hidden>↗</span></button>)}</div></div> : <>
        <p className="result-count" role="status" aria-live="polite">{hits.length ? `${hits.length} ${hits.length === 1 ? t('result') : t('results')}` : t('noResults')} {t('for')} «{query}»</p>
        {!hits.length && <div className="empty-state"><h3>{t('noMatches')}</h3><p>{t('noMatchesHelp')}</p><button type="button" onClick={() => { setQuery(''); input.current?.focus(); }}>{t('clear')}</button></div>}
        {groups.map(group => { const items = hits.filter(h => h.group === group); const label=t(group === 'MEDICAMENTOS' ? 'groupMedicines' : group === 'CALCULADORAS' ? 'groupCalculators' : group === 'HERRAMIENTAS' ? 'groupTools' : 'groupReferences'); return items.length > 0 && <section className="result-group" key={group} aria-label={label}><h3 className="eyebrow">{label}<span>{items.length}</span></h3><ul>{items.map(hit => <li key={hit.id}><div><Link data-result href={hit.href} className="result-link" onClick={() => setOpen(false)}><span className="result-icon" aria-hidden>{group === 'MEDICAMENTOS' ? '◇' : group === 'CALCULADORAS' ? '∑' : group === 'REFERENCIAS' ? '↗' : '☷'}</span><span><strong>{hit.title}</strong><small>{hit.id.startsWith('aemps-') ? `${t('regulatoryProduct')} · ${hit.description.split('·').at(-1)?.trim()}` : hit.description}</small>{hit.approximate && <span className="approximate">{t('approximate')}</span>}</span><span className="arrow" aria-hidden>→</span></Link>{activeCase && hit.substanceSlug && group === 'MEDICAMENTOS' && <Link data-result className="patient-action" href={`/calculadoras/dose?medicamento=${encodeURIComponent(hit.substanceSlug)}`} onClick={() => setOpen(false)}>{t('calculateFor')} {caseLabel(activeCase)} <span aria-hidden>→</span></Link>}</div></li>)}</ul></section>; })}
      </>}
      <p className="search-footer">{t('clinicalChoice')}</p>
    </div>}
  </div>;
}

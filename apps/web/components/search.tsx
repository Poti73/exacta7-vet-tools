'use client';
import { useEffect, useMemo, useRef, useState, useId, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { catalog, createSearch, groups, type Group } from '@exacta7/knowledge';
import { caseLabel, usePatient } from './patient-context';
const search = createSearch(catalog);
export function ClinicalSearch({ compact = false, medicationOnly = false }: { compact?: boolean; medicationOnly?: boolean }) {
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
    <form role="search" aria-label={compact ? 'Búsqueda global' : 'Búsqueda clínica'} onSubmit={e => { e.preventDefault(); setOpen(true); }}>
      <label className="sr-only" htmlFor={id}>{compact ? 'Buscar en Exacta7' : 'Buscar medicamentos, calculadoras y fuentes'}</label>
      <div className="search-input"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><input id={id} ref={input} type="search" value={query} maxLength={120} autoComplete="off" placeholder={compact ? 'Buscar en Exacta7…' : 'Principio activo, nombre comercial, indicación…'} onChange={e => { setQuery(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} aria-controls={`${id}-results`} /><kbd>{compact ? 'Ctrl K' : '↵'}</kbd></div>
    </form>
    {show && <div className={compact ? 'search-popover' : ''} id={`${id}-results`}>
      {!compact && !medicationOnly && <div className="filter-tabs" aria-label="Filtrar resultados"><button type="button" aria-pressed={!filter} onClick={() => setFilter(undefined)}>Todo</button>{groups.map(group => <button type="button" aria-pressed={filter === group} key={group} onClick={() => setFilter(group)}>{group.charAt(0)+group.slice(1).toLowerCase()}</button>)}</div>}
      {!query.trim() ? <div className="search-idle"><span className="eyebrow">{compact ? 'BUSCA POR NOMBRE O CONTEXTO' : 'EXPLORA EL CONOCIMIENTO CLÍNICO'}</span><p>Encuentra fichas, herramientas y referencias en un solo lugar.</p><div className="suggestions">{['Propofol', 'CRI', 'Anestesia', 'AEMPS'].map(q => <button type="button" key={q} onClick={() => { setQuery(q); input.current?.focus(); }}>{q} <span aria-hidden>↗</span></button>)}</div></div> : <>
        <p className="result-count" role="status" aria-live="polite">{hits.length ? `${hits.length} resultado${hits.length === 1 ? '' : 's'}` : 'Sin resultados'} para «{query}»</p>
        {!hits.length && <div className="empty-state"><h3>No encontramos coincidencias</h3><p>Prueba con menos términos, un principio activo o una vía. El catálogo solo contiene información disponible para consulta pública.</p><button type="button" onClick={() => { setQuery(''); input.current?.focus(); }}>Limpiar búsqueda</button></div>}
        {groups.map(group => { const items = hits.filter(h => h.group === group); return items.length > 0 && <section className="result-group" key={group} aria-label={group}><h3 className="eyebrow">{group}<span>{items.length}</span></h3><ul>{items.map(hit => <li key={hit.id}><div><Link data-result href={hit.href} className="result-link" onClick={() => setOpen(false)}><span className="result-icon" aria-hidden>{group === 'MEDICAMENTOS' ? '◇' : group === 'CALCULADORAS' ? '∑' : group === 'REFERENCIAS' ? '↗' : '☷'}</span><span><strong>{hit.title}</strong><small>{hit.description}</small>{hit.approximate && <span className="approximate">Correspondencia aproximada · comprueba el nombre</span>}</span><span className="arrow" aria-hidden>→</span></Link>{activeCase && hit.substanceSlug && group === 'MEDICAMENTOS' && <Link data-result className="patient-action" href={`/calculadoras/dose?medicamento=${encodeURIComponent(hit.substanceSlug)}`} onClick={() => setOpen(false)}>Calcular para {caseLabel(activeCase)} <span aria-hidden>→</span></Link>}</div></li>)}</ul></section>; })}
      </>}
      <p className="search-footer">La selección clínica corresponde al profesional.</p>
    </div>}
  </div>;
}

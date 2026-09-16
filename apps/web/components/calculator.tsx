'use client';
import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { calculate, type CalculationInput } from '@exacta7/clinical-core';
import { isPublished, presentations, recommendations } from '@exacta7/knowledge';
import { caseLabel, caseSummary, usePatient, type ClinicalCase } from './patient-context';
type Result = ReturnType<typeof calculate>;
type Props = { tool: 'dose' | 'cri' | 'fluidos'; substanceId?: string; drugName?: string };
type CaseToolState = { indication: string; route: string; rate: string; unit: string; presentationId: string; manual: string; concentrationUnit: string; verified: boolean; professional: boolean; result: { value: Result; signature: string; calculationId: string; createdAt: string } | null };
export function Calculator(props: Props) { const { activeCase } = usePatient(); return <CalculatorForCase key={activeCase?.case_id ?? 'no-case'} {...props} activeCase={activeCase} />; }
function CalculatorForCase({ tool, substanceId, drugName, activeCase }: Props & { activeCase: ClinicalCase | null }) {
  const { getToolState, saveToolState, saveCalculation } = usePatient();
  const toolKey = `${tool}:${substanceId ?? 'general'}`;
  const saved = activeCase ? getToolState<CaseToolState>(activeCase.case_id, toolKey) : null;
  const [indication, setIndication] = useState(saved?.indication ?? ''); const [route, setRoute] = useState(saved?.route ?? '');
  const [rate, setRate] = useState(saved?.rate ?? ''); const [unit, setUnit] = useState(saved?.unit ?? '');
  const [presentationId, setPresentationId] = useState(saved?.presentationId ?? ''); const [manual, setManual] = useState(saved?.manual ?? ''); const [concentrationUnit, setConcentrationUnit] = useState(saved?.concentrationUnit ?? '');
  const [verified, setVerified] = useState(saved?.verified ?? false); const [professional, setProfessional] = useState(saved?.professional ?? false);
  const [result, setResult] = useState<CaseToolState['result']>(saved?.result ?? null); const [error, setError] = useState('');
  const available = presentations.filter(p => p.substanceId === substanceId && p.source.kind === 'regulatory' && isPublished(p.publication, p.source) && p.species.includes(activeCase?.species ?? ''));
  const selected = available.find(p => p.id === presentationId);
  const concentration = selected?.concentration ?? (presentationId === 'manual' ? manual : '');
  const cUnit = selected?.concentrationUnit ?? concentrationUnit;
  const signature = JSON.stringify({ caseId: activeCase?.case_id, indication, route, rate, unit, presentationId, concentration, cUnit, verified, professional });
  const currentResult = result?.signature === signature ? result.value : null;
  // The case id and fields are the persistence boundary. Depending on the context object
  // itself would write again after every store notification and could retain stale data.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (activeCase) saveToolState(activeCase.case_id, toolKey, { indication, route, rate, unit, presentationId, manual, concentrationUnit, verified, professional, result }); }, [activeCase?.case_id, concentrationUnit, indication, manual, presentationId, professional, rate, result, route, toolKey, unit, verified]);
  function submit(e: FormEvent) {
    e.preventDefault(); setResult(null); setError('');
    try {
      if (!activeCase || activeCase.status !== 'ACTIVE') throw new Error('Selecciona o crea un caso activo antes de calcular.');
      if (!professional) throw new Error('Confirma el uso profesional.');
      if (!indication.trim() || !route.trim()) throw new Error('Selecciona la indicación y la vía.');
      if (tool !== 'fluidos' && (!presentationId || !verified)) throw new Error('Selecciona y verifica la concentración con el producto físico.');
      if (selected && !selected.routes.includes(route.trim())) throw new Error('La vía no coincide con las vías publicadas de esta presentación. Revisa la ficha técnica.');
      const validUnits = tool === 'dose' ? ['mg/kg','µg/kg'] : tool === 'cri' ? ['mg/kg/h','µg/kg/min'] : ['mL/kg/h'];
      if (!validUnits.includes(unit)) throw new Error('Selecciona la unidad de dosis/tasa.');
      const value = calculate({ weight: activeCase.weight, rate, rateUnit: unit as CalculationInput['rateUnit'], concentration, concentrationUnit: cUnit as CalculationInput['concentrationUnit'] });
      const calculated = { value, signature, calculationId: crypto.randomUUID(), createdAt: new Date().toISOString() };
      setResult(calculated); saveCalculation({ calculation_id: calculated.calculationId, case_id: activeCase.case_id, tool_type: tool, created_at: calculated.createdAt, result: { value, inputs: { indication, route, rate, unit, presentationId, concentration, cUnit } } });
    } catch (err) { setError((err as Error).message); }
  }
  const guidance = recommendations.filter(r => r.substanceId === substanceId && ['guideline','literature'].includes(r.source.kind) && isPublished(r.publication, r.source));
  return <div className="calculator-layout"><form className="panel form-stack" onSubmit={submit}>
    <div className="section-heading"><h2>Datos del cálculo</h2><span className="tag">Selección profesional</span></div>
    {drugName && <p>Medicamento: <strong>{drugName}</strong></p>}
    <div className="patient-summary">{activeCase ? <><strong>Paciente activo: {caseLabel(activeCase)} · {caseSummary(activeCase)}</strong><Link href="/paciente">Gestionar casos</Link></> : <Link href="/paciente?new=1">Crear un caso antes de calcular →</Link>}</div>
    <div className="form-grid"><label>Indicación<input required value={indication} onChange={e => setIndication(e.target.value)} placeholder="Introduce la indicación elegida" maxLength={160}/></label><label>Vía<input required value={route} onChange={e => setRoute(e.target.value)} placeholder="Introduce la vía elegida" maxLength={80}/></label></div>
    <div className="form-grid"><label>{tool === 'dose' ? 'Dosis seleccionada' : 'Tasa seleccionada'}<input required inputMode="decimal" value={rate} onChange={e => setRate(e.target.value)} placeholder="Introduce el valor" autoComplete="off"/></label><label>Unidad<select required value={unit} onChange={e => setUnit(e.target.value)}><option value="">Selecciona la unidad</option>{(tool === 'dose' ? ['mg/kg','µg/kg'] : tool === 'cri' ? ['mg/kg/h','µg/kg/min'] : ['mL/kg/h']).map(u => <option key={u}>{u}</option>)}</select></label></div>
    {tool !== 'fluidos' && <fieldset className="concentration"><legend>Presentación y concentración</legend><label>Origen de la concentración<select required value={presentationId} onChange={e => { setPresentationId(e.target.value); setVerified(false); }}><option value="">Selecciona una presentación u origen</option>{available.map(p => <option key={p.id} value={p.id}>{p.product} · {p.label}</option>)}<option value="manual">Concentración introducida por el profesional</option></select></label>{!available.length && <p className="small-text muted">No hay presentaciones AEMPS revisadas para este medicamento y especie.</p>}
      {presentationId === 'manual' && <div className="form-grid"><label>Concentración<input required inputMode="decimal" value={manual} onChange={e => { setManual(e.target.value); setVerified(false); }} autoComplete="off"/></label><label>Unidad de concentración<select required value={concentrationUnit} onChange={e => { setConcentrationUnit(e.target.value); setVerified(false); }}><option value="">Selecciona la unidad</option><option>mg/mL</option><option>µg/mL</option></select></label></div>}
      {presentationId && <div className="selected-concentration"><span className="eyebrow">CONCENTRACIÓN SELECCIONADA</span><strong>{concentration || 'Pendiente'} {cUnit}</strong><p>{selected ? `${selected.product} · ${selected.label}` : 'Introducida manualmente · no validada por AEMPS'}</p>{selected && <a href={selected.source.url}>Ver ficha técnica original ↗</a>}<label className="checkbox"><input type="checkbox" required checked={verified} onChange={e => setVerified(e.target.checked)}/><span>He verificado que la concentración seleccionada coincide con el producto físico que tengo delante.</span></label></div>}
    </fieldset>}
    <label className="checkbox"><input type="checkbox" required checked={professional} onChange={e => setProfessional(e.target.checked)}/><span>Confirmo el uso profesional veterinario y he verificado los datos y su adecuación al paciente.</span></label>
    {error && <p role="alert" className="error-text">{error}</p>}<button className="primary" type="submit">Calcular {tool === 'dose' ? 'cantidad y volumen' : 'caudal'} <span aria-hidden>→</span></button>
  </form><aside><section className="result-panel" aria-live="polite"><p className="eyebrow">RESULTADO MATEMÁTICO</p>{currentResult ? <><h2 className="numeric-result">{currentResult.volume} <small>{currentResult.unit}</small></h2><p className="calculated-for"><strong>Calculado para: {activeCase ? `${caseLabel(activeCase)} · ${caseSummary(activeCase)}` : 'Caso no disponible'}</strong></p><p>Cantidad: {currentResult.total} {currentResult.totalUnit}</p><p>{rate} {unit}{tool !== 'fluidos' && <><br/>Concentración: {concentration} {cUnit}</>}</p><p>Indicación: {indication}<br/>Vía: {route}</p><details open><summary>Ver cálculo</summary><p>{currentResult.formula}</p><p className="calculation-steps">{currentResult.steps}</p><p className="small-text">Motor {currentResult.version} · cálculo {result?.calculationId} · no ajustado a dispositivo.</p></details><p className="small-text">Fuente de la dosis/tasa: selección del profesional.{selected ? ` Concentración: ${selected.source.title}, versión ${selected.publication.version}, revisión ${selected.publication.reviewedAt}.` : ' Sin recomendación clínica incorporada.'}</p></> : <><h2>Listo cuando tú lo estés.</h2><p>Completa y verifica los datos para ver la cantidad, el volumen y todos los pasos.</p></>}<p className="small-text result-disclaimer">El resultado no es una instrucción de administración. Comprueba su adecuación clínica y la precisión del dispositivo.</p></section><section className="reference-note"><h3>Contexto y referencias</h3>{guidance.length ? <Link href={`/medicamentos/${substanceId}#recomendaciones`}>Consultar rangos publicados en la ficha →</Link> : <p>No hay rangos publicados incorporados a esta herramienta. No se comprueba la adecuación clínica de la dosis introducida.</p>}<Link href="/fuentes">Ver metodología →</Link></section></aside></div>;
}

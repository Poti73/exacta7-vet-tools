'use client';

import { calculateDilution, calculateDripRate, convertUnit, findCalculator, type Unit } from '@exacta7/clinical-core';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { useI18n } from './i18n';
import { CalculationReceipt } from './calculation-receipt';
import { FavoriteButton } from './local-workspace';

import type { UserAccessState } from '../lib/billing';

type SimpleTool = 'unit-converter' | 'dilutions' | 'drip-rate';
type Props = { tool: SimpleTool; proAllowed: boolean; accessState?: UserAccessState };
const units: Unit[] = ['µg', 'mg', 'g', 'mL', 'L', 'kg'];

export function SimpleCalculatorScreen({ tool, proAllowed, accessState }: Props) {
  const { locale } = useI18n();
  const metadata = findCalculator(tool)!;
  const isProTool = metadata.plan === 'pro';
  const isLocked = isProTool && !proAllowed;
  const isAuthenticated = accessState?.isAuthenticated ?? false;

  const t = locale === 'en' ? {
    crumb: 'Calculators',
    eye: 'TRANSPARENT CALCULATION',
    lead: 'You select the values. Exacta7 shows the mathematical operation.',
    lockedAnon: 'This is an Exacta7 Pro tool. Its mathematical formula, units, source and warnings remain visible. To execute and save calculations, sign in or subscribe to Pro.',
    lockedFree: 'This is an Exacta7 Pro tool. Your current account is on Exacta7 Free. Upgrade to Pro to execute and save calculations.',
    plans: 'View plans',
    signIn: 'Sign in to calculate',
    upgrade: 'Upgrade to Exacta7 Pro',
    source: 'Mathematical source',
    review: 'Review status',
    published: 'Published calculation',
    calculate: 'Calculate',
    result: 'MATHEMATICAL RESULT',
    ready: 'Ready when you are.',
    readyText: 'Enter the required values to see the calculation.',
    value: 'Value',
    from: 'From unit',
    to: 'To unit',
    sourceConcentration: 'Source concentration (mg/mL)',
    targetConcentration: 'Target concentration (mg/mL)',
    finalVolume: 'Final volume (mL)',
    flow: 'Flow (mL/h)',
    dropFactor: 'Administration set drop factor (drops/mL)',
    stock: 'Source solution',
    diluent: 'Diluent',
    output: 'Result',
    steps: 'Show calculation',
    disclaimer: 'This record is a mathematical calculation, not an administration instruction.',
    lockedError: 'Exacta7 Pro subscription required to run this calculation.',
  } : locale === 'fr' ? {
    crumb: 'Calculateurs',
    eye: 'CALCUL TRANSPARENT',
    lead: 'Vous choisissez les valeurs. Exacta7 affiche l’opération mathématique.',
    lockedAnon: 'Il s’agit d’un outil Exacta7 Pro. Sa formule mathématique, ses unités, sa source et ses avertissements restent visibles. Pour exécuter et enregistrer des calculs, connectez-vous ou passez à Pro.',
    lockedFree: 'Il s’agit d’un outil Exacta7 Pro. Votre compte actuel est Exacta7 Gratuit. Passez à Pro pour exécuter et enregistrer des calculs.',
    plans: 'Voir les formules',
    signIn: 'Se connecter pour calculer',
    upgrade: 'Passer à Exacta7 Pro',
    source: 'Source mathématique',
    review: 'État de révision',
    published: 'Calcul publié',
    calculate: 'Calculer',
    result: 'RÉSULTAT MATHÉMATIQUE',
    ready: 'Prêt quand vous l’êtes.',
    readyText: 'Saisissez les valeurs nécessaires pour voir le calcul.',
    value: 'Valeur',
    from: 'Unité source',
    to: 'Unité cible',
    sourceConcentration: 'Concentration initiale (mg/mL)',
    targetConcentration: 'Concentration finale (mg/mL)',
    finalVolume: 'Volume final (mL)',
    flow: 'Débit (mL/h)',
    dropFactor: 'Facteur de goutte du perfuseur (gouttes/mL)',
    stock: 'Solution initiale',
    diluent: 'Diluant',
    output: 'Résultat',
    steps: 'Voir le calcul',
    disclaimer: 'Ce registre est un calcul mathématique, pas une instruction d’administration.',
    lockedError: 'Abonnement Exacta7 Pro requis pour exécuter ce calcul.',
  } : {
    crumb: 'Calculadoras',
    eye: 'CÁLCULO TRANSPARENTE',
    lead: 'Tú seleccionas los valores. Exacta7 muestra la operación matemática.',
    lockedAnon: 'Esta es una herramienta Exacta7 Pro. Su fórmula matemática, unidades, fuente y advertencias siguen visibles. Para ejecutar y guardar cálculos, inicia sesión o contrata Pro.',
    lockedFree: 'Esta es una herramienta Exacta7 Pro. Tu cuenta actual es Exacta7 Gratis. Contrata Pro para ejecutar y guardar cálculos.',
    plans: 'Ver planes',
    signIn: 'Acceder para calcular',
    upgrade: 'Contratar Exacta7 Pro',
    source: 'Fuente matemática',
    review: 'Estado de revisión',
    published: 'Cálculo publicado',
    calculate: 'Calcular',
    result: 'RESULTADO MATEMÁTICO',
    ready: 'Listo cuando tú lo estés.',
    readyText: 'Introduce los valores necesarios para ver el cálculo.',
    value: 'Valor',
    from: 'Unidad de origen',
    to: 'Unidad de destino',
    sourceConcentration: 'Concentración inicial (mg/mL)',
    targetConcentration: 'Concentración final (mg/mL)',
    finalVolume: 'Volumen final (mL)',
    flow: 'Caudal (mL/h)',
    dropFactor: 'Factor de goteo del equipo (gotas/mL)',
    stock: 'Solución inicial',
    diluent: 'Diluyente',
    output: 'Resultado',
    steps: 'Ver cálculo',
    disclaimer: 'Este registro es un cálculo matemático, no una instrucción de administración.',
    lockedError: 'Se requiere suscripción Exacta7 Pro activa para ejecutar este cálculo.',
  };

  return (
    <>
      <div className="breadcrumb">
        <Link href="/calculadoras">{t.crumb}</Link>
        <span>/</span>
        {metadata.name[locale]}
      </div>
      <div className="page-intro compact">
        <p className="eyebrow green">{t.eye}</p>
        <h1>{metadata.name[locale]}</h1>
        <p className="lead">{metadata.description[locale]} {t.lead}</p>
        <FavoriteButton favorite={{ id: `calculator:${tool}`, kind: 'calculator', label: metadata.name[locale], href: `/calculadoras/${tool}` }} />
      </div>

      {isLocked && (
        <div className="notice" role="status">
          <strong>Exacta7 Pro.</strong>{' '}
          {isAuthenticated ? t.lockedFree : t.lockedAnon}{' '}
          {isAuthenticated ? (
            <Link href="/planes" className="primary" style={{ display: 'inline-flex', minHeight: '34px', padding: '6px 14px', marginLeft: '10px' }}>
              {t.upgrade} →
            </Link>
          ) : (
            <>
              <Link href={`/acceso?next=/calculadoras/${tool}`} className="primary" style={{ display: 'inline-flex', minHeight: '34px', padding: '6px 14px', marginLeft: '10px', marginRight: '8px' }}>
                {t.signIn} →
              </Link>
              <Link href="/planes">
                {t.plans} →
              </Link>
            </>
          )}
        </div>
      )}

      <SimpleCalculator tool={tool} disabled={isLocked} proAllowed={proAllowed} labels={t} />

      <section className="reference-note">
        <h2>{t.source}</h2>
        <p><a href={metadata.mathSource.url} target="_blank" rel="noreferrer">{metadata.mathSource.title} ↗</a> · {metadata.mathSource.version}</p>
        <p>{t.review}: {metadata.reviewState === 'published' ? t.published : metadata.reviewState}</p>
        <p className="small-text">{metadata.warnings.join(' ')}</p>
      </section>
    </>
  );
}

function SimpleCalculator({ tool, disabled, proAllowed, labels }: { tool: SimpleTool; disabled: boolean; proAllowed: boolean; labels: Record<string, string> }) {
  const [value, setValue] = useState('');
  const [from, setFrom] = useState<Unit>('mg');
  const [to, setTo] = useState<Unit>('µg');
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const [finalVolume, setFinalVolume] = useState('');
  const [flow, setFlow] = useState('');
  const [dropFactor, setDropFactor] = useState('');
  const [result, setResult] = useState<{ headline: string; details: string; formula: string; steps: string; calculationId: string; createdAt: string } | null>(null);
  const [error, setError] = useState('');

  function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setResult(null);

    // Strict client-side verification to prevent calculation or saving if unauthorized
    if (!proAllowed) {
      setError(labels.lockedError);
      return;
    }

    try {
      const receipt = { calculationId: crypto.randomUUID(), createdAt: new Date().toISOString() };
      if (tool === 'unit-converter') {
        const converted = convertUnit(value, from, to);
        setResult({ headline: `${converted.value} ${converted.unit}`, details: `${value} ${from} → ${converted.value} ${to}`, formula: converted.formula, steps: converted.formula, ...receipt });
      }
      if (tool === 'dilutions') {
        const diluted = calculateDilution({ sourceConcentration: source, targetConcentration: target, finalVolume });
        setResult({ headline: `${diluted.stockVolume} mL`, details: `${labels.stock}: ${diluted.stockVolume} mL · ${labels.diluent}: ${diluted.diluentVolume} mL`, formula: diluted.formula, steps: diluted.steps, ...receipt });
      }
      if (tool === 'drip-rate') {
        const drip = calculateDripRate({ flow, dropFactor });
        setResult({ headline: `${drip.dropsPerMinute} ${drip.unit}`, details: `${flow} mL/h · ${dropFactor} gotas/mL`, formula: drip.formula, steps: drip.steps, ...receipt });
      }
    } catch (caught) {
      setError((caught as Error).message);
    }
  }

  return (
    <div className="calculator-layout">
      <form className="panel form-stack" onSubmit={submit}>
        <fieldset disabled={disabled} className="simple-calculator-fields">
          {tool === 'unit-converter' && (
            <>
              <label>{labels.value}<input required inputMode="decimal" value={value} onChange={event => setValue(event.target.value)} autoComplete="off" /></label>
              <div className="form-grid">
                <label>{labels.from}<select value={from} onChange={event => setFrom(event.target.value as Unit)}>{units.map(unit => <option key={unit}>{unit}</option>)}</select></label>
                <label>{labels.to}<select value={to} onChange={event => setTo(event.target.value as Unit)}>{units.map(unit => <option key={unit}>{unit}</option>)}</select></label>
              </div>
            </>
          )}
          {tool === 'dilutions' && (
            <>
              <label>{labels.sourceConcentration}<input required inputMode="decimal" value={source} onChange={event => setSource(event.target.value)} autoComplete="off" /></label>
              <label>{labels.targetConcentration}<input required inputMode="decimal" value={target} onChange={event => setTarget(event.target.value)} autoComplete="off" /></label>
              <label>{labels.finalVolume}<input required inputMode="decimal" value={finalVolume} onChange={event => setFinalVolume(event.target.value)} autoComplete="off" /></label>
            </>
          )}
          {tool === 'drip-rate' && (
            <>
              <label>{labels.flow}<input required inputMode="decimal" value={flow} onChange={event => setFlow(event.target.value)} autoComplete="off" /></label>
              <label>{labels.dropFactor}<input required inputMode="decimal" value={dropFactor} onChange={event => setDropFactor(event.target.value)} autoComplete="off" /></label>
            </>
          )}
          <button className="primary" type="submit" disabled={disabled}>
            {labels.calculate} <span aria-hidden>→</span>
          </button>
        </fieldset>
        {error && <p className="error-text" role="alert">{error}</p>}
      </form>
      <aside>
        <section className="result-panel" aria-live="polite">
          <p className="eyebrow">{labels.result}</p>
          {result ? (
            <>
              <h2 className="numeric-result">{result.headline}</h2>
              <p>{result.details}</p>
              <details open>
                <summary>{labels.steps}</summary>
                <p>{result.formula}</p>
                <p className="calculation-steps">{result.steps}</p>
              </details>
              <CalculationReceipt data={{ calculationId: result.calculationId, createdAt: result.createdAt, calculator: tool, inputs: tool === 'unit-converter' ? [[labels.value, value], [labels.from, from], [labels.to, to]] : tool === 'dilutions' ? [[labels.sourceConcentration, source], [labels.targetConcentration, target], [labels.finalVolume, finalVolume]] : [[labels.flow, flow], [labels.dropFactor, dropFactor]], result: result.headline, formula: result.formula, steps: result.steps, source: 'NIST · International System of Units', version: '0.1.0', warnings: [labels.disclaimer] }} />
            </>
          ) : (
            <>
              <h2>{labels.ready}</h2>
              <p>{labels.readyText}</p>
            </>
          )}
          <p className="small-text result-disclaimer">{labels.disclaimer}</p>
        </section>
      </aside>
    </div>
  );
}


import Decimal from 'decimal.js';
export * from './registry';
const D = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP });
export const CORE_VERSION = '0.1.0';
export function positive(value: string, label: string): Decimal {
  const text = value.trim().replace(',', '.');
  if (text.length > 24 || !/^\d+(\.\d+)?$/.test(text)) throw new Error(`${label}: introduce un número positivo sin separadores de miles.`);
  const n = new D(text);
  if (!n.isFinite() || n.lte(0) || n.gt('1000000000')) throw new Error(`${label}: valor fuera de los límites matemáticos.`);
  return n;
}
export type CalculationInput = { weight: string; rate: string; rateUnit: 'mg/kg' | 'µg/kg' | 'mg/kg/h' | 'µg/kg/min' | 'mL/kg/h'; concentration?: string; concentrationUnit?: 'mg/mL' | 'µg/mL' };
export function calculate(input: CalculationInput) {
  const weight = positive(input.weight, 'Peso'); const rate = positive(input.rate, 'Dosis/tasa');
  const allowed = ['mg/kg','µg/kg','mg/kg/h','µg/kg/min','mL/kg/h'];
  if (!allowed.includes(input.rateUnit)) throw new Error('Unidad de dosis no compatible.');
  const micro = input.rateUnit.startsWith('µg');
  const hourly = input.rateUnit === 'µg/kg/min';
  const infusion = input.rateUnit.endsWith('/h') || hourly;
  const total = weight.mul(rate).div(micro ? 1000 : 1).mul(hourly ? 60 : 1);
  if (input.rateUnit === 'mL/kg/h') return { total: total.toString(), volume: total.toString(), unit: 'mL/h', totalUnit: 'mL/h', formula: 'peso (kg) × tasa (mL/kg/h) = caudal (mL/h)', steps: `${weight} × ${rate} = ${total} mL/h`, version: CORE_VERSION };
  if (!input.concentration || !['mg/mL','µg/mL'].includes(input.concentrationUnit ?? '')) throw new Error('Selecciona concentración y unidad.');
  const concentration = positive(input.concentration, 'Concentración').div(input.concentrationUnit === 'µg/mL' ? 1000 : 1);
  const volume = total.div(concentration);
  return { total: total.toString(), volume: volume.toSignificantDigits(10).toString(), unit: infusion ? 'mL/h' : 'mL', totalUnit: infusion ? 'mg/h' : 'mg', formula: 'peso × dosis/tasa → cantidad en mg; cantidad ÷ concentración en mg/mL → volumen/caudal', steps: `${weight} kg × ${rate} ${input.rateUnit}${micro ? ' ÷ 1000 (µg → mg)' : ''}${hourly ? ' × 60 (min → h)' : ''} = ${total} ${infusion ? 'mg/h' : 'mg'}; ${total} ÷ ${concentration} mg/mL = ${volume.toSignificantDigits(10)} ${infusion ? 'mL/h' : 'mL'}`, version: CORE_VERSION };
}

export type Unit = 'µg' | 'mg' | 'g' | 'mL' | 'L' | 'kg';
const unitFactors: Record<Unit, { dimension: 'mass' | 'volume' | 'weight'; factor: Decimal }> = {
  'µg': { dimension: 'mass', factor: new D('0.000001') }, mg: { dimension: 'mass', factor: new D('0.001') }, g: { dimension: 'mass', factor: new D(1) },
  mL: { dimension: 'volume', factor: new D('0.001') }, L: { dimension: 'volume', factor: new D(1) }, kg: { dimension: 'weight', factor: new D(1) },
};
export function convertUnit(value: string, from: Unit, to: Unit) {
  const source = unitFactors[from]; const target = unitFactors[to];
  if (!source || !target || source.dimension !== target.dimension) throw new Error('Las unidades no son compatibles.');
  const amount = positive(value, 'Valor');
  return { value: amount.mul(source.factor).div(target.factor).toSignificantDigits(12).toString(), unit: to, formula: `${amount} ${from} × ${source.factor.div(target.factor)} = resultado en ${to}`, version: CORE_VERSION };
}
export function calculateDilution(input: { sourceConcentration: string; targetConcentration: string; finalVolume: string }) {
  const source = positive(input.sourceConcentration, 'Concentración inicial'); const target = positive(input.targetConcentration, 'Concentración final'); const finalVolume = positive(input.finalVolume, 'Volumen final');
  if (target.gt(source)) throw new Error('La concentración final no puede superar la concentración inicial en esta herramienta de dilución.');
  const stockVolume = target.mul(finalVolume).div(source); const diluentVolume = finalVolume.minus(stockVolume);
  return { stockVolume: stockVolume.toSignificantDigits(12).toString(), diluentVolume: diluentVolume.toSignificantDigits(12).toString(), finalVolume: finalVolume.toString(), unit: 'mL', formula: 'C₁ × V₁ = C₂ × V₂; V₁ = (C₂ × V₂) ÷ C₁', steps: `${target} mg/mL × ${finalVolume} mL ÷ ${source} mg/mL = ${stockVolume.toSignificantDigits(12)} mL de solución inicial; ${finalVolume} − ${stockVolume.toSignificantDigits(12)} = ${diluentVolume.toSignificantDigits(12)} mL de diluyente`, version: CORE_VERSION };
}
export function calculateDripRate(input: { flow: string; dropFactor: string }) {
  const flow = positive(input.flow, 'Caudal'); const dropFactor = positive(input.dropFactor, 'Factor de goteo'); const dropsPerMinute = flow.mul(dropFactor).div(60);
  return { dropsPerMinute: dropsPerMinute.toSignificantDigits(12).toString(), unit: 'gotas/min', formula: 'mL/h × gotas/mL ÷ 60 min/h = gotas/min', steps: `${flow} mL/h × ${dropFactor} gotas/mL ÷ 60 = ${dropsPerMinute.toSignificantDigits(12)} gotas/min`, version: CORE_VERSION };
}

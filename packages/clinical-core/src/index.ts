import Decimal from 'decimal.js';
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

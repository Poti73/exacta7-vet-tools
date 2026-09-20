import { describe, it, expect } from 'vitest';
import { calculate, calculateDilution, calculateDripRate, calculatorRegistry, convertUnit, positive } from '../../packages/clinical-core/src/index';
describe('clinical-core: operaciones matemáticas, no recomendaciones', () => {
  it('convierte peso por dosis y concentración sin error binario', () => {
    expect(calculate({ weight: '18.4', rate: '0.1', rateUnit: 'mg/kg', concentration: '0.2', concentrationUnit: 'mg/mL' })).toMatchObject({ total: '1.84', volume: '9.2', unit: 'mL' });
  });
  it('convierte µg a mg y minutos a horas exactamente una vez', () => {
    expect(calculate({ weight: '18.4', rate: '2', rateUnit: 'µg/kg/min', concentration: '1', concentrationUnit: 'mg/mL' })).toMatchObject({ total: '2.208', volume: '2.208', unit: 'mL/h' });
  });
  it('soporta concentración en µg/mL', () => {
    expect(calculate({ weight: '4', rate: '5', rateUnit: 'µg/kg', concentration: '10', concentrationUnit: 'µg/mL' }).volume).toBe('2');
  });
  it('no aplica factor 60 a mg/kg/h', () => {
    expect(calculate({ weight: '10', rate: '2', rateUnit: 'mg/kg/h', concentration: '5', concentrationUnit: 'mg/mL' }).volume).toBe('4');
  });
  it('fluidoterapia y coma decimal', () => {
    expect(calculate({ weight: '18,4', rate: '3', rateUnit: 'mL/kg/h' }).volume).toBe('55.2');
  });
  it.each(['', '-1', '0', 'NaN', 'Infinity', '1e3', '1.000,2', '1000000001', '1/2', '<script>'])('rechaza %s', value => expect(() => positive(value, 'Dato')).toThrow());
  it('rechaza concentración ausente o cero', () => {
    expect(() => calculate({ weight: '1', rate: '1', rateUnit: 'mg/kg' })).toThrow();
    expect(() => calculate({ weight: '1', rate: '1', rateUnit: 'mg/kg', concentration: '0', concentrationUnit: 'mg/mL' })).toThrow();
  });
  it('convierte únicamente dimensiones compatibles', () => {
    expect(convertUnit('1', 'mg', 'µg')).toMatchObject({ value: '1000', unit: 'µg' });
    expect(convertUnit('1.25', 'L', 'mL')).toMatchObject({ value: '1250', unit: 'mL' });
    expect(() => convertUnit('1', 'mg', 'mL')).toThrow(/compatibles/);
    expect(() => convertUnit('0', 'mg', 'µg')).toThrow();
  });
  it('calcula una dilución sin inferir compatibilidad ni diluyente', () => {
    expect(calculateDilution({ sourceConcentration: '10', targetConcentration: '2', finalVolume: '50' })).toMatchObject({ stockVolume: '10', diluentVolume: '40', unit: 'mL' });
    expect(() => calculateDilution({ sourceConcentration: '2', targetConcentration: '10', finalVolume: '50' })).toThrow();
    expect(() => calculateDilution({ sourceConcentration: '10', targetConcentration: '2', finalVolume: 'NaN' })).toThrow();
  });
  it('calcula gotas/min sin seleccionar un equipo o tratamiento', () => {
    expect(calculateDripRate({ flow: '60', dropFactor: '20' })).toMatchObject({ dropsPerMinute: '20', unit: 'gotas/min' });
    expect(() => calculateDripRate({ flow: '-1', dropFactor: '20' })).toThrow();
  });
  it('no publica fórmulas veterinarias pendientes de revisión', () => {
    expect(calculatorRegistry.filter(item => item.reviewState === 'published').map(item => item.id)).toEqual(['dose', 'cri', 'fluidos', 'unit-converter', 'dilutions', 'drip-rate']);
    expect(calculatorRegistry.filter(item => item.reviewState !== 'published')).toHaveLength(6);
  });
});

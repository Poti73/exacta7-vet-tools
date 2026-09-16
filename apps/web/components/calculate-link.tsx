'use client';
import Link from 'next/link';
import { caseLabel, usePatient } from './patient-context';
export function CalculateLink({ slug }: { slug: string }) { const { activeCase } = usePatient(); return <Link className="primary" href={`/calculadoras/dose?medicamento=${slug}`}>{activeCase ? `Calcular para ${caseLabel(activeCase)}` : 'Abrir calculadora'} →</Link>; }

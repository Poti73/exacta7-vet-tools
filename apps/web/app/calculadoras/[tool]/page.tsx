import { notFound } from 'next/navigation';
import { substances } from '@exacta7/knowledge';
import { findRegulatoryProduct, toRegulatoryCalculatorProduct } from '@exacta7/knowledge/regulatory';
import { CalculatorScreen } from '../../../components/localized-headings';
export default async function Page({ params, searchParams }: { params: Promise<{tool: string}>; searchParams: Promise<{medicamento?: string}> }) {
  const { tool } = await params; if (tool !== 'dose' && tool !== 'cri' && tool !== 'fluidos') notFound();
  const { medicamento } = await searchParams; const drug = substances.find(d => d.slug === medicamento); const regulatoryProduct = medicamento ? findRegulatoryProduct(medicamento) : undefined;
  if (medicamento && !drug && !regulatoryProduct) notFound();
  return <CalculatorScreen tool={tool} substanceId={drug?.id} drugName={drug?.name ?? regulatoryProduct?.name} regulatoryProduct={regulatoryProduct ? toRegulatoryCalculatorProduct(regulatoryProduct) : undefined}/>;
}

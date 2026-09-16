import { notFound } from 'next/navigation';
import { substances } from '@exacta7/knowledge';
import { CalculatorScreen } from '../../../components/localized-headings';
export default async function Page({ params, searchParams }: { params: Promise<{tool: string}>; searchParams: Promise<{medicamento?: string}> }) {
  const { tool } = await params; if (tool !== 'dose' && tool !== 'cri' && tool !== 'fluidos') notFound();
  const { medicamento } = await searchParams; const drug = substances.find(d => d.slug === medicamento); if (medicamento && !drug) notFound();
  return <CalculatorScreen tool={tool} substanceId={drug?.id} drugName={drug?.name}/>;
}

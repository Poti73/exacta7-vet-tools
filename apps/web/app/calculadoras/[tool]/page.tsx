import Link from 'next/link';
import { notFound } from 'next/navigation';
import { substances } from '@exacta7/knowledge';
import { Calculator } from '../../../components/calculator';
const titles = { dose: 'Dosis y volumen', cri: 'Infusión continua · CRI', fluidos: 'Fluidoterapia' };
export default async function Page({ params, searchParams }: { params: Promise<{tool: string}>; searchParams: Promise<{medicamento?: string}> }) {
  const { tool } = await params; if (tool !== 'dose' && tool !== 'cri' && tool !== 'fluidos') notFound();
  const { medicamento } = await searchParams; const drug = substances.find(d => d.slug === medicamento); if (medicamento && !drug) notFound();
  return <><div className="breadcrumb"><Link href="/calculadoras">Calculadoras</Link><span>/</span>{titles[tool]}</div><div className="page-intro compact"><p className="eyebrow green">CÁLCULO TRANSPARENTE</p><h1>{titles[tool]}</h1><p className="lead">Tú seleccionas los valores. Exacta7 muestra las operaciones.</p></div><Calculator key={`${tool}-${medicamento ?? ''}`} tool={tool} substanceId={drug?.id} drugName={drug?.name}/></>;
}

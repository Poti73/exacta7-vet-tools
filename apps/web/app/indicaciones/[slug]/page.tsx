import { notFound } from 'next/navigation';
import { findIndication } from '@exacta7/knowledge';
import { IndicationExplorer } from '../../../components/indication-explorer';

export const metadata = { title: 'Explorar por indicación', robots: { index: false, follow: true } };
export default async function IndicationPage({ params }: { params: Promise<{ slug: string }> }) { const indication = findIndication((await params).slug); if (!indication) notFound(); return <IndicationExplorer indication={indication} />; }

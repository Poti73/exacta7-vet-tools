import { notFound } from 'next/navigation';
import { findRegulatoryProduct, regulatoryRelease } from '@exacta7/knowledge/regulatory';
import { substances } from '@exacta7/knowledge';
import { MedicineDetail } from '../../../components/medicine-detail';
export async function generateMetadata({ params }: {params:Promise<{slug:string}>}) { const {slug}=await params; return {title:findRegulatoryProduct(slug)?.name ?? substances.find(item=>item.slug===slug)?.name ?? 'Medicamento'}; }
export default async function Page({ params }: {params:Promise<{slug:string}>}) { const {slug}=await params; const product=findRegulatoryProduct(slug); const shell=substances.find(item=>item.slug===slug); if(!product&&!shell)notFound(); return <MedicineDetail product={product ?? null} shellName={shell?.name} release={regulatoryRelease.release}/>; }

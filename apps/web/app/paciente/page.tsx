import { PatientScreen } from '../../components/localized-headings';
export const metadata = { title: 'Paciente actual', robots: { index: false, follow: false } };
export default async function Page({ searchParams }: { searchParams: Promise<{ new?: string }> }) { const params = await searchParams; return <PatientScreen forceNew={params.new === '1'}/>; }

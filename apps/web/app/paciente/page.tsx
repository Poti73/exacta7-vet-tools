import { PatientForm } from '../../components/patient';
export const metadata = { title: 'Paciente actual' };
export default async function Page({ searchParams }: { searchParams: Promise<{ new?: string }> }) { const params = await searchParams; return <><div className="page-intro compact"><p className="eyebrow green">CONTEXTO CLÍNICO</p><h1>Paciente actual</h1><p className="lead">Un peso verificado para todas tus herramientas.</p></div><PatientForm forceNew={params.new === '1'}/> </>; }

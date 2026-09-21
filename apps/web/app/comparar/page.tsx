import { GeoPage } from '../../components/geo-page';
import { publicMetadata } from '../../lib/seo';

export const metadata = publicMetadata('/comparar', 'Comparar herramientas veterinarias', 'Comparativas factuales de Exacta7, CIMA Vet, Plumb’s y VIN según fuente, contexto, flujo y límites.');

export default function Page() {
  return <GeoPage eyebrow="COMPARAR HERRAMIENTAS" title="Elige según la necesidad de información" lead="Las herramientas veterinarias no resuelven el mismo problema. Esta guía distingue fuente regulatoria, referencia clínica, comunidad profesional y cálculo transparente." sections={[
    { title: 'Cómo leer estas comparativas', paragraphs: ['Exacta7 reúne datos regulatorios AEMPS/CIMA Vet publicados, contexto local de paciente, calculadoras matemáticas y fuentes trazables. No selecciona tratamientos, medicamentos ni dosis.', 'CIMA Vet/AEMPS es la fuente oficial de información regulatoria en España. Las referencias clínicas y comunidades profesionales tienen un alcance diferente.'] },
    { title: 'Comparativas disponibles', links: [{ href: '/comparar/exacta7-vs-cima-vet', label: 'Exacta7 vs CIMA Vet' }, { href: '/comparar/exacta7-vs-plumbs', label: 'Exacta7 vs Plumb’s' }, { href: '/comparar/exacta7-vs-vin', label: 'Exacta7 vs VIN' }] },
  ]} links={[{ href: '/fuentes', label: 'Fuentes y metodología' }, { href: '/planes', label: 'Planes de Exacta7' }]} />;
}

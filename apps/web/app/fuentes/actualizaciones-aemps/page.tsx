import { GeoPage, JsonLd } from '../../../components/geo-page';
import { breadcrumbJsonLd, publicMetadata } from '../../../lib/seo';

export const metadata = publicMetadata('/fuentes/actualizaciones-aemps', 'Actualización AEMPS/CIMA Vet: 2026-09-16', 'Transparencia sobre el snapshot regulatorio AEMPS/CIMA Vet publicado por Exacta7: fecha, cifras, exclusiones y proceso de revisión.');

export default function Page() {
  return <><JsonLd value={breadcrumbJsonLd([{ name: 'Inicio', path: '/' }, { name: 'Fuentes', path: '/fuentes' }, { name: 'Actualización AEMPS', path: '/fuentes/actualizaciones-aemps' }])}/><GeoPage eyebrow="TRANSPARENCIA REGULATORIA" title="Actualización AEMPS/CIMA Vet: corte 2026-09-16" lead="Este snapshot describe datos regulatorios publicados por Exacta7. No contiene dosis, tratamientos ni recomendaciones clínicas." sections={[
    { title: 'Resumen del snapshot', table: { headers: ['Concepto', 'Dato'], rows: [['Fecha de datos fuente', '2026-09-16'], ['Productos originales', '3.261'], ['Presentaciones originales', '14.024'], ['Productos publicados', '3.239'], ['Presentaciones publicadas', '13.928'], ['Productos anulados excluidos', '21'], ['Producto excluido por IDs de principios activos irresolubles', 'EU/2/96/001/003']] } },
    { title: 'Cómo se publica', paragraphs: ['El proceso importa el nomenclátor oficial, normaliza datos, compara cambios, deja el resultado pendiente de revisión y publica solo el catálogo regulatorio aprobado. Una actualización no se publica automáticamente.', 'El producto EU/2/96/001/003 se excluyó porque tres identificadores de principio activo no pudieron resolverse mediante el propio diccionario AEMPS. No se infirieron nombres.'] },
    { title: 'Arquitectura de futuras actualizaciones', paragraphs: ['El modelo de publicación conserva fecha de corte, cifras de origen y publicación, filtros y exclusiones. Un diff futuro solo se mostrará cuando exista una comparación verificable de snapshots; no se inventa historial.'] },
    { title: 'Fuente oficial', paragraphs: ['AEMPS identifica CIMA Vet como su Centro de Información online de Medicamentos Veterinarios. Consulta siempre la fuente oficial para información regulatoria vigente.'], links: [{ href: 'https://www.aemps.gob.es/medicamentos-veterinarios/', label: 'AEMPS: medicamentos veterinarios' }, { href: 'https://sede.aemps.gob.es/datos-abiertos/', label: 'AEMPS: datos abiertos' }] },
  ]} links={[{ href: '/fuentes', label: 'Fuentes y metodología' }, { href: '/medicamentos', label: 'Consultar catálogo publicado' }]} /></>;
}

import { GeoPage } from '../../../components/geo-page';
import { publicMetadata } from '../../../lib/seo';

export const metadata = publicMetadata('/para/veterinarios', 'Exacta7 para veterinarios', 'Flujo de consulta regulatoria AEMPS, contexto local de paciente, calculadoras transparentes y fuentes para profesionales veterinarios.');

export default function Page() {
  return <GeoPage eyebrow="PARA VETERINARIOS" title="Fuente, contexto y cálculo transparente" lead="Exacta7 conecta la consulta de medicamentos veterinarios AEMPS/CIMA Vet publicados con un contexto local temporal y operaciones matemáticas trazables. La decisión sigue siendo profesional." sections={[
    { title: 'Flujo de trabajo', items: ['Paciente: define un caso temporal local con especie y peso.', 'Medicamento: consulta el registro regulatorio publicado y sus enlaces oficiales.', 'Presentación: verifica físicamente y selecciona la concentración aplicable.', 'Calculadora: introduce los valores seleccionados por el profesional.', 'Resultado: revisa unidades, fórmula, pasos, advertencias y fuente.', 'Registro: conserva el cálculo en el caso local mientras esté activo.'] },
    { title: 'Qué hace y qué no hace', paragraphs: ['Exacta7 no diagnostica, no selecciona medicamentos, no elige dosis, no propone protocolos y no determina la adecuación clínica de un resultado matemático.', 'Los casos se conservan localmente en el navegador. Tras 12 horas de inactividad requieren revisión; al finalizar un caso se eliminan del navegador junto con sus cálculos.'] },
    { title: 'Para verificar', paragraphs: ['CIMA Vet/AEMPS continúa siendo la fuente oficial de información regulatoria. Las recomendaciones clínicas solo pueden publicarse después de revisión humana y no se derivan automáticamente del catálogo.'] },
  ]} links={[{ href: '/medicamentos', label: 'Explorar medicamentos' }, { href: '/calculadoras', label: 'Abrir calculadoras' }, { href: '/fuentes', label: 'Consultar metodología' }]} />;
}

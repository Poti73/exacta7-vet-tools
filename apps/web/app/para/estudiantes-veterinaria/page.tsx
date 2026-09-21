import { GeoPage } from '../../../components/geo-page';
import { publicMetadata } from '../../../lib/seo';

export const metadata = publicMetadata('/para/estudiantes-veterinaria', 'Exacta7 para estudiantes de Veterinaria', 'Herramientas veterinarias para comprender unidades, fórmulas, datos regulatorios AEMPS y cálculos transparentes.');

export default function Page() {
  return <GeoPage eyebrow="PARA ESTUDIANTES" title="Comprender el cálculo y la fuente antes del resultado" lead="Exacta7 puede ayudar a estudiar cómo se relacionan unidades, peso, concentración, volumen, tasas y fuentes. No sustituye la universidad, profesores, manuales, prácticas ni literatura." sections={[
    { title: 'Qué puedes explorar', items: ['Datos regulatorios publicados desde AEMPS/CIMA Vet: producto, presentación, especies y vías autorizadas.', 'Conversión de unidades y operaciones deterministas.', 'Relación matemática entre valores introducidos, fórmula y resultado.', 'Fuentes y metodología visibles para distinguir dato regulatorio, evidencia clínica y cálculo.'] },
    { title: 'Cómo usarlo para aprender', paragraphs: ['Introduce únicamente un ejemplo matemático ficticio y observa cómo cambian las unidades y los pasos. El resultado no es una instrucción de administración ni una recomendación terapéutica.', 'La selección de medicamento, indicación, vía, dosis y concentración corresponde al profesional. Exacta7 no la automatiza.'] },
    { title: 'Límites importantes', paragraphs: ['El catálogo AEMPS/CIMA Vet es regulatorio; no transforma por sí solo una ficha en una pauta clínica. Las decisiones de aprendizaje y práctica deben contrastarse con docencia, bibliografía y supervisión apropiada.'] },
  ]} links={[{ href: '/calculadoras', label: 'Explorar calculadoras' }, { href: '/medicamentos', label: 'Consultar vademécum AEMPS' }, { href: '/fuentes', label: 'Ver fuentes y metodología' }]} />;
}

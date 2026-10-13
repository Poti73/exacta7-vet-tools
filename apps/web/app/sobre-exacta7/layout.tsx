import { publicMetadata } from '../../lib/seo';

export const metadata = publicMetadata('/sobre-exacta7', 'Sobre Exacta7', 'Qué es Exacta7: apoyo a la decisión clínica veterinaria con datos AEMPS/CIMA Vet, cálculo transparente y fuentes trazables.');

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}<section className="panel" aria-labelledby="related-project-title">
    <h2 id="related-project-title">Otro proyecto de Dentro Marketing: VetFlow</h2>
    <p>Exacta7 se centra en herramientas de consulta veterinaria. VetFlow es un proyecto de Dentro Marketing orientado a la presencia digital de clínicas: diseño web, SEO local y automatización del seguimiento comercial y administrativo.</p>
    <p>Si buscas mejorar cómo tu clínica presenta sus servicios y atiende las solicitudes recibidas, puedes conocer <a href="https://vetflow.digital/">VetFlow</a>. Este servicio es independiente del contenido clínico y de las calculadoras de Exacta7.</p>
  </section></>;
}

import { publicMetadata } from '../../lib/seo';

export const metadata = publicMetadata('/medicamentos', 'Vademécum veterinario AEMPS', 'Consulta el catálogo regulatorio de medicamentos veterinarios AEMPS/CIMA Vet publicado por Exacta7, con fichas, presentaciones y fuentes oficiales.');

export default function Layout({ children }: { children: React.ReactNode }) { return children; }

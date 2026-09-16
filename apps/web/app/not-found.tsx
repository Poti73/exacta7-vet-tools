import Link from 'next/link';
export default function NotFound() { return <div className="page-intro"><p className="eyebrow">404</p><h1>No encontramos esta página</h1><p>Comprueba el enlace o busca en el vademécum.</p><Link className="primary" href="/medicamentos">Ir a medicamentos →</Link></div>; }

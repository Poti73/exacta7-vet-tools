'use client';
export default function ErrorPage({ reset }: { reset: () => void }) { return <div className="page-intro" role="alert"><h1>No se pudo cargar el contenido</h1><p>Inténtalo de nuevo. No uses información incompleta para un cálculo.</p><button className="primary" onClick={reset}>Volver a intentar</button></div>; }

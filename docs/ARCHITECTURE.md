# Arquitectura

Next.js App Router: páginas de directorio/ficha en servidor y componentes interactivos de búsqueda, paciente y cálculo en cliente. knowledge contiene datos tipados y proyección pública. clinical-core es independiente de React y de las fuentes, y solo resuelve operaciones matemáticas.

PatientProvider valida un almacén versionado de `localStorage`, mantiene el caso activo al navegar y ofrece fallback en memoria si no está disponible. Cada caso tiene un `case_id` UUID y conserva de forma aislada el estado de sus herramientas y los cálculos identificados por `calculation_id`. A las 8 horas muestra una advertencia de revisión; a las 12 horas pasa a EXPIRED y ya no puede alimentar cálculos hasta una reactivación explícita. Finalizar elimina el registro local completo del caso. No hay escritura remota ni registro de búsquedas.

Ver SEARCH-ARCHITECTURE.md para indexación, publicación y propuesta de backend. La app incluye endpoint /api/health. La indexación pública usa metadatos canónicos, `robots.txt` y un sitemap generado desde el catálogo regulatorio publicado.

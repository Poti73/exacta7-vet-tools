# Arquitectura de búsqueda — decisión 2026-09-16

## Alcance y modelo actual

El workspace inicial carecía de código. Se implementa un monorepo: `apps/web`, `packages/knowledge`, `packages/clinical-core`.

`knowledge` separa Substance, Presentation, Recommendation, Source y Publication. Las presentaciones contienen producto, identificador regulatorio, etiqueta, concentración, especie y vía. Las recomendaciones contienen contexto, especie, indicación, vía, clase (dosis/CRI), rango, unidad y fuente. Ninguna recomendación se obtiene de una fuente secundaria o de datos regulatorios.

`buildIndex` produce documentos de medicamentos, presentaciones, calculadoras específicas y referencias asociadas. Solo admite datos PUBLISHED con reviewer, fecha válida, versión y sourceId coincidente. Una sustancia sin publicación es únicamente una ficha de navegación vacía; no expone categorías clínicas. Las herramientas generales y los enlaces bibliográficos no afirman ser recomendaciones revisadas.

Los productos comerciales y presentaciones se buscan por sus campos, no solo por nombre exacto. Las recomendaciones revisadas enriquecen la búsqueda por indicación/especie/vía/CRI. El catálogo inicial está deliberadamente vacío de estos datos, pendiente de revisión humana.

## Motor local

Índice precomputado por sesión; normalización NFD, eliminación de acentos, minúsculas y equivalencia µ/μ/u. Consultas de hasta 120 caracteres y 12 términos. AND entre términos. Coincidencia exacta > prefijo > distancia Damerau-Levenshtein de 1, únicamente para términos de al menos 4 caracteres. Una errata no se convierte silenciosamente en una selección; se muestra “Correspondencia aproximada”. No se aproxima IV/IM/CRI. Desempate por id estable. Máximo 60 resultados, agrupados visualmente.

No hay inferencia de dosis ni ranking por popularidad clínica. Las especies/vías de productos se mantienen en los productos; la especie del paciente no oculta resultados globales. La selección de presentación en el cálculo sí exige coincidencia de especie publicada.

Sin peticiones por pulsación, sin logs de consultas y sin latencia de red. Coste O(documentos × términos), adecuado para el MVP pequeño. La prueba sintética con ~1.000 documentos es un límite de regresión, no una medición de producción ni un benchmark PostgreSQL.

## Evaluación Supabase: FTS + pg_trgm

Fuentes oficiales consultadas:
- https://supabase.com/docs/guides/database/full-text-search
- https://www.postgresql.org/docs/current/pgtrgm.html

FTS permite tokenización, ponderación y prefijos; por sí solo no resuelve faltas de escritura. `pg_trgm` ofrece similitud e índices GIN/GiST y debe complementar las coincidencias exactas/prefijo. Para nombres farmacológicos conviene `simple` y alias revisados; stemming español puede emplearse en campos de indicación separados, no en identificadores.

Propuesta cuando exista catálogo revisado voluminoso:
1. Tablas normalizadas con políticas RLS; staging en esquema privado sin acceso anon.
2. Proyección `search_documents` únicamente de revisiones publicadas. Retirada/archivado y actualización de la proyección en la misma transacción. No almacenar o exponer dosis en el snippet de búsqueda.
3. Campo normalizado persistido por pipeline, `tsvector` con configuración `simple`; índice GIN sobre vector y GIN `gin_trgm_ops` sobre nombre/alias normalizado. Normalización idéntica a la consulta; evitar depender de `unaccent` en expresiones generated/immutable sin estudiar su volatilidad.
4. RPC SECURITY INVOKER, grants SELECT/EXECUTE mínimos, RLS que verifique publicación de la entidad y su fuente asociada, límite duro, timeout y parámetros tipados. No usar SECURITY DEFINER para saltarse RLS. No confiar en estados editables desde el cliente.
5. Ranking exacto → prefijo FTS → similitud trigram; umbral calibrado con fixtures de nombres parecidos. AND por contexto, alias explícitos y aviso de coincidencia aproximada. No aproximar tokens cortos.
6. Cliente: debounce 120 ms, AbortController, identificador de petición para descartar respuestas antiguas, estados cargando/error y reintento. No cachear resultados clínicos retirados sin versionado/invalidation.
7. Verificar con EXPLAIN ANALYZE, RLS anon/autenticado, revocación de publicaciones, acentos, errores, paginación, latencia p95 y planes de índice antes de adoptarlo.

Decisión: motor local determinista para esta base pequeña; FTS + pg_trgm recomendado para crecimiento. No se afirma paridad de ranking entre ambos sin pruebas. No se ha creado un proyecto Supabase ni aplicado SQL. El inventario conectado no contenía un proyecto Exacta7; no se usa otro proyecto. No hay migración fingida ni prueba SQL presentada como ejecutada.

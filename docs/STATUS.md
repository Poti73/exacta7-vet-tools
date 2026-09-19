# Exacta7 — estado del módulo

Actualizado 2026-09-16. La carpeta inicial no tenía aplicación ni repositorio git. La entrega implementa la petición explícita de buscador clínico y vademécum con el documento general como contexto.

## Implementado

- Monorepo Next.js/TypeScript con `packages/knowledge` y `packages/clinical-core`.
- Buscador en header y portada, destacado en móvil. Coincidencias por campos estructurados, prefijos, acentos/no acentos y un error de escritura. Teclado, touch, estados vacíos y resultados agrupados.
- `/medicamentos` y `/medicamentos/[slug]` publican el catálogo regulatorio AEMPS con las cinco secciones solicitadas; propofol conserva una ficha de navegación sin dosis clínicas.
- Modelo e índice para marcas/presentaciones AEMPS, categorías, indicaciones, especies, vías y recomendaciones CRI revisadas. Tests usan fixtures sintéticos, nunca datos de muestra en producción.
- Casos clínicos locales: múltiples pacientes activos aislados por `case_id` UUID, selector persistente, aviso de revisión tras 8 horas y expiración a las 12 horas de inactividad. Cada cálculo lleva su `calculation_id`, `case_id`, tipo y fecha; finalizar elimina localmente el caso y sus cálculos.
- Acción de cálculo desde resultados/ficha con transferencia automática del peso del caso activo y selección explícita de los demás campos.
- Calculadoras dosis/volumen, CRI y fluidos con Decimal. Confirmación de concentración y producto físico antes de calcular, también para entrada manual. Invalidación del resultado cuando cambian inputs.
- Directorio de fuentes; separación regulatoria/guías/literatura/MSD. Búsqueda sin LLM ni telemetría.
- Selector persistente ES/EN/FR en la navegación, portada, buscador, vademécum, fichas regulatorias, calculadoras, fuentes y página `/sobre-exacta7`.
- UI con imagen de marca facilitada, Manrope/Inter locales, verde bosque y pizarra. Capturas en docs/screenshots.
- Evaluación FTS/pg_trgm documentada en SEARCH-ARCHITECTURE.md; sin proyecto Supabase Exacta7 disponible y sin uso de proyectos ajenos.

## Validación

- 53 pruebas unitarias aprobadas (búsqueda, publicación AEMPS, unidades, decimales, casos aislados, caducidad e inválidos).
- 12 E2E aprobados en Chrome: escritorio, viewport móvil y tableta. Flujos de teclado, typo, ficha, paciente 18.4 kg, confirmaciones, cálculo, invalidación, persistencia, 404 y ausencia de desbordamiento.
- Lint y TypeScript aprobados. Build final de Next aprobado tras ajustes visuales y restauración de paciente.
- Revisadas capturas de escritorio y móvil. Se corrigió desbordamiento móvil detectado visualmente.
- CI definida, pero no ejecutada en GitHub porque no se creó ni publicó repositorio en esta entrega.

## Catálogo AEMPS publicado

El 16/09/2026 se descargó el nomenclátor veterinario oficial de AEMPS/CIMA Vet. El importador reproducible está en `scripts/import-aemps-nomenclator.ps1`; el staging y la fuente raw se excluyen de Git. `scripts/publish-aemps-catalog.mjs` genera una publicación reproducible con 3.239 productos autorizados y resueltos y 13.928 presentaciones autorizadas. La aplicación no publica dosis, indicaciones clínicas ni rangos a partir de estos datos regulatorios.

La validación encontró tres IDs activos sin entrada en el diccionario AEMPS que acompaña al mismo archivo (`9085`, `9086`, `9087`), asociados al registro `EU/2/96/001/003`. Ese producto se excluye de la publicación y no se infieren nombres. También se excluyen 21 productos anulados.

## Pendiente para uso clínico real

1. Automatizar el diff de futuras versiones AEMPS y mantener la aprobación humana antes de cada publicación.
2. Completar revisión veterinaria de recomendaciones clínicas. El catálogo regulatorio publicado no es una monografía de dosis.
3. Implementar backend de publicación, identidad de revisores y auditoría; el modelo tipado actual no sustituye estos controles.
4. La modalidad PRO guardada/sincronizada sigue pendiente de autenticación, backend y consentimiento explícito. La modalidad actual es local y no transmite datos clínicos.
5. Si se adopta Supabase: crear proyecto dedicado tras verificar coste/autorización, implementar RLS/RPC y medir FTS/pg_trgm. No hay SQL aplicado ni pruebas remotas.
5. Completar revisión legal, seguridad de producción y staging antes de desplegar. La app permanece noindex y local.

## Entorno

`pnpm dev` abre http://127.0.0.1:3000. No requiere credenciales. Ver README para comandos. Versiones fijadas y lockfile. ESLint 9.39.1/TypeScript 5.9.3 se fijaron por incompatibilidad de plugins con ESLint 10/TS7; revisar soporte antes de producción.

La revisión externa `21st review` fue bloqueada por auto-review por posible envío de código a un tercero. Se sustituyó por revisión visual local y Playwright, sin exportar código.

No se ha leído ni utilizado el archivo local de recuperación de Stripe. Está excluido en .gitignore.

## Actualización operativa — 2026-09-19

- Repositorio publicado en GitHub y aplicación desplegada en Dokploy en `https://exacta7.com`.
- Supabase Auth/PostgreSQL conecta cuentas Free y Pro. Las credenciales de Stripe y precios actuales son de prueba; los cobros reales siguen desactivados hasta migrar todas las claves, precios y webhook a producción.
- Se añadieron los recursos de planes ES, EN y FR y el selector cambia la interfaz de navegación, acceso, cuenta, calculadoras, catálogo, fuentes, contacto y planes.
- La búsqueda de portada permite filtrar de forma funcional entre todos, medicamentos, calculadoras, herramientas y referencias incluso sin una consulta escrita.
- El índice AEMPS incluye códigos nacionales de presentación, sin duplicar las 13.928 etiquetas de envase y degradar la búsqueda incremental.
- La calculadora recibe presentaciones de una ficha AEMPS y solo muestra una concentración cuando está declarada literalmente en el nombre regulatorio de un producto con un único principio activo. Se mantiene la verificación del producto físico y la selección profesional de indicación, vía y dosis.
- El webhook de Stripe verifica firma, registra eventos de forma idempotente y trata los fallos de escritura de Supabase como errores para que Stripe pueda reintentar.


# Exacta7 — estado del módulo

Actualizado 2026-09-16. La carpeta inicial no tenía aplicación ni repositorio git. La entrega implementa la petición explícita de buscador clínico y vademécum con el documento general como contexto.

## Implementado

- Monorepo Next.js/TypeScript con `packages/knowledge` y `packages/clinical-core`.
- Buscador en header y portada, destacado en móvil. Coincidencias por campos estructurados, prefijos, acentos/no acentos y un error de escritura. Teclado, touch, estados vacíos y resultados agrupados.
- `/medicamentos` y `/medicamentos/[slug]`, ficha propofol de navegación con las cinco secciones solicitadas.
- Modelo e índice para marcas/presentaciones AEMPS, categorías, indicaciones, especies, vías y recomendaciones CRI revisadas. Tests usan fixtures sintéticos, nunca datos de muestra en producción.
- Casos clínicos locales: múltiples pacientes activos aislados por `case_id` UUID, selector persistente, aviso de revisión tras 8 horas y expiración a las 12 horas de inactividad. Cada cálculo lleva su `calculation_id`, `case_id`, tipo y fecha; finalizar elimina localmente el caso y sus cálculos.
- Acción de cálculo desde resultados/ficha con transferencia automática del peso del caso activo y selección explícita de los demás campos.
- Calculadoras dosis/volumen, CRI y fluidos con Decimal. Confirmación de concentración y producto físico antes de calcular, también para entrada manual. Invalidación del resultado cuando cambian inputs.
- Directorio de fuentes; separación regulatoria/guías/literatura/MSD. Búsqueda sin LLM ni telemetría.
- UI con imagen de marca facilitada, Manrope/Inter locales, verde bosque y pizarra. Capturas en docs/screenshots.
- Evaluación FTS/pg_trgm documentada en SEARCH-ARCHITECTURE.md; sin proyecto Supabase Exacta7 disponible y sin uso de proyectos ajenos.

## Validación

- 50 pruebas unitarias aprobadas (búsqueda, publicación, unidades, decimales, casos aislados, caducidad e inválidos).
- 12 E2E aprobados en Chrome: escritorio, viewport móvil y tableta. Flujos de teclado, typo, ficha, paciente 18.4 kg, confirmaciones, cálculo, invalidación, persistencia, 404 y ausencia de desbordamiento.
- Lint y TypeScript aprobados. Build final de Next aprobado tras ajustes visuales y restauración de paciente.
- Revisadas capturas de escritorio y móvil. Se corrigió desbordamiento móvil detectado visualmente.
- CI definida, pero no ejecutada en GitHub porque no se creó ni publicó repositorio en esta entrega.

## Importación AEMPS realizada en staging

El 16/09/2026 se descargó el nomenclátor veterinario oficial de AEMPS/CIMA Vet. El importador reproducible está en `scripts/import-aemps-nomenclator.ps1`; el staging y la fuente raw se excluyen de Git. Resultado: 3.261 productos y 14.024 presentaciones en `PENDING_REVIEW`. La aplicación pública no consume esos registros y no se publican dosis, indicaciones clínicas ni rangos.

La validación encontró tres IDs activos sin entrada en el diccionario AEMPS que acompaña al mismo archivo (`9085`, `9086`, `9087`), asociados a un producto porcino. Están marcados para resolución manual y no se infieren.

## Pendiente para uso clínico real

1. Revisar el aviso legal de AEMPS y completar raw/diff en una base de datos dedicada. La primera importación existe solo en staging local.
2. Completar catálogo y revisión veterinaria. Propofol sigue siendo una ficha vacía pública, aunque staging incluye productos AEMPS; no es una monografía validada.
3. Implementar backend de publicación, identidad de revisores y auditoría; el modelo tipado actual no sustituye estos controles.
4. La modalidad PRO guardada/sincronizada sigue pendiente de autenticación, backend y consentimiento explícito. La modalidad actual es local y no transmite datos clínicos.
5. Si se adopta Supabase: crear proyecto dedicado tras verificar coste/autorización, implementar RLS/RPC y medir FTS/pg_trgm. No hay SQL aplicado ni pruebas remotas.
5. Completar revisión legal, seguridad de producción y staging antes de desplegar. La app permanece noindex y local.

## Entorno

`pnpm dev` abre http://127.0.0.1:3000. No requiere credenciales. Ver README para comandos. Versiones fijadas y lockfile. ESLint 9.39.1/TypeScript 5.9.3 se fijaron por incompatibilidad de plugins con ESLint 10/TS7; revisar soporte antes de producción.

La revisión externa `21st review` fue bloqueada por auto-review por posible envío de código a un tercero. Se sustituyó por revisión visual local y Playwright, sin exportar código.

No se ha leído ni utilizado el archivo local de recuperación de Stripe. Está excluido en .gitignore. No se han modificado pagos, DNS, VPS ni otros proyectos.


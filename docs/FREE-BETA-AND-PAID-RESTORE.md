# Beta gratuita y recuperación del diseño de pago

Preparada localmente el 12 de octubre de 2026. Publicación autorizada por el titular después de revisar la vista previa.

## Diseño conservado

- `snapshots/pre-free-beta-2026-10-12.zip`: copia previa de 109 archivos versionados de interfaz, CSS, imágenes de marca, rutas, lógica de acceso y pruebas. No incluye archivos de entorno, claves, códigos de recuperación ni documentos ajenos al alcance.
- `snapshots/pre-free-beta-2026-10-12.sha256`: hashes SHA-256 de los originales incluidos.
- El diseño mensual/anual continúa en `PaidPricing` dentro de `apps/web/components/pricing.tsx`, junto con sus imágenes, textos ES/EN/FR y estilos originales.
- Precios, identidad del comprador, webhook y estados reales de suscripción se conservan. No se asigna Pro ficticio a usuarios ni se modifican registros remotos.

## Modo beta

`apps/web/lib/product-mode.ts` contiene `productMode.freeBeta: true`. Este ajuste compartido controla presentación, acceso a calculadoras publicadas, cuenta, condiciones, metadatos y ofertas estructuradas. Checkout y portal responden 403 antes de consultar Auth, base de datos o Stripe. El webhook conserva su funcionamiento.

Todas las calculadoras publicadas se pueden ejecutar sin cuenta ni tarjeta. Las herramientas pendientes de revisión siguen fuera del catálogo y devuelven 404. Se mantiene el cálculo y sus advertencias existentes; no se añaden recomendaciones clínicas.

Los textos informan de gratuidad durante la beta, sin fecha de monetización ni contratación automática. El enlace de comentarios utiliza la página de contacto existente. No se añade telemetría ni se envían parámetros clínicos.

## Volver a suscripciones

1. Antes de cambiar el modo: confirmar posibilidad de facturación, revisar información legal y condiciones, configuración Stripe real (precios, claves y webhook), y cualquier suscripción existente. La beta no cancela ni detiene renovaciones que ya existan en Stripe. Mientras esté bloqueado el portal, las gestiones de suscripciones existentes deben resolverse con el titular en Stripe.
2. Cambiar `productMode.freeBeta` a `false`. Esto restaura el diseño de pago y los bloqueos Pro, además del acceso a Checkout y portal. El cambio requiere build y despliegue; no hay parámetro de URL ni variable remota para activarlo por accidente.
3. Ejecutar typecheck, lint, unitarias, build y E2E. Las pruebas de interfaz de pago se conservan y se activan en modo de pago. Las unitarias comprueban ambos modos.
4. Revisar ES/EN/FR, escritorio y móvil, y validar contratación, cancelación y acceso con Stripe en modo de prueba. Comunicar los cambios de acceso antes del relanzamiento y pedir autorización para publicar.

Para consultar el diseño histórico, extraer el ZIP en una carpeta distinta. No sobrescribir el proyecto actual: el archivo es una referencia exacta, mientras que el interruptor conserva la implementación actualizada.

## Validación

- 112 pruebas unitarias aprobadas, incluidos bloqueo de Checkout/portal antes de cualquier llamada externa, recuperación del modo de pago y regresiones matemáticas.
- TypeScript y ESLint aprobados. Compilación Next.js de producción aprobada.
- 39 casos E2E aplicables verificados en Chrome: escritorio, móvil y tableta. La primera ejecución completa dio 38 aprobados y un timeout en la prueba móvil de finalizar casos; esa prueba pasó al repetirla aisladamente. Las 18 pruebas de interfaz de pago se omiten durante la beta y se conservan para el relanzamiento.
- ES/EN/FR comprobados; diluciones y goteo ejecutados sin cuenta; Checkout/portal responden 403; herramientas pendientes devuelven 404; ofertas JSON-LD únicamente de precio cero.
- Capturas finales revisadas en `screenshots/free-beta-desktop.png`, `screenshots/free-beta-mobile.png` y `screenshots/free-beta-tablet.png`. Se regeneraron los tres casos españoles cerrando el aviso de cookies: 3 pruebas adicionales aprobadas.
- Copia ZIP verificada frente a los 109 hashes SHA-256.

Se utilizaron los ejecutables ya instalados en `node_modules/.bin` porque el lanzador global de pnpm intentaba consultar el registro. Las pruebas unitarias usan una carpeta temporal dentro de `node_modules/.cache` para evitar un error de acceso a temporales del sandbox de Windows. Build y Chrome se ejecutaron fuera del sandbox tras aprobación automática.

Durante la preparación no se hicieron commit, push, despliegue ni cambios remotos en Supabase/Stripe. La vista local no tiene credenciales de Auth; esta validación cubre los flujos públicos de la beta, no registro o acceso a cuentas reales. Ningún control local confirma el estado de producción ni sustituye la revisión veterinaria.

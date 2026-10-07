# Auditoría Stripe / Checkout / Billing — 7–8 de octubre de 2026

## Alcance y resultado

Revisión del código y del esquema SQL disponible en este repositorio. No se ha accedido ni modificado Stripe Dashboard. No se han aplicado cambios remotos, desplegado, hecho commit ni push. No se han cambiado precios, Price IDs, Product IDs, planes, Auth, permisos, lógica clínica ni páginas legales. Se mantienen 7,99 €/mes y 59,99 €/año.

El conector Supabase no ofrece un proyecto Exacta7 identificable: solo devuelve un proyecto ajeno e inactivo, que no se ha consultado. No hay credenciales del proyecto configuradas en este entorno. Por tanto, el esquema de producción, las claves Test/Live, la versión del endpoint de webhook y la configuración fiscal real no están verificados. README y STATUS mencionan Stripe de prueba; eso no demuestra el estado actual de producción.

La configuración futura debe tratar Exacta7 como servicio prestado por vía electrónica, según la instrucción del titular. En B2B deberá revisar establecimiento y domicilio fiscal, y el encaje de localización/inversión del sujeto pasivo cuando corresponda: Canarias (IGIC/REPEP), Península/Baleares, UE y terceros países. Esos escenarios son requisitos para la revisión fiscal posterior; el código no los traduce en reglas, exenciones ni tipos impositivos.

## A. Implementación anterior

| Área | Estado encontrado |
| --- | --- |
| Checkout | `POST /api/billing/checkout`, autenticación por `getClaims`, `mode: subscription`, Price ID mensual/anual desde variables existentes, cantidad 1, promociones habilitadas. |
| Customer | Reutiliza `profiles.stripe_customer_id`. Si falta, crea Customer con email y `metadata.supabase_user_id`, clave de idempotencia por usuario y guarda el ID antes de Checkout. |
| Metadata | Customer, Checkout Session y Subscription incluyen `supabase_user_id`. Session también usa `client_reference_id`. |
| Supabase | `profiles`: usuario/Customer ID/fechas; `subscriptions`: usuario/Customer/Subscription/Price/status/fin de periodo/cancelación/fechas; `billing_events`: ID único del evento/tipo/procesamiento/error/fechas. No hay tabla `customers`, tabla de pagos ni columnas fiscales en el SQL disponible. |
| Acceso | Pro depende de `active` o `trialing`; restantes estados son Free. |
| Webhook | Firma sobre cuerpo sin parsear, registro y detección de eventos ya procesados. Gestiona Checkout completado y creación/actualización/eliminación de suscripciones. Algunas escrituras de registro no comprobaban errores. |
| Portal | `POST /api/billing/portal`, reutiliza Customer y la configuración predeterminada de Stripe, vuelve a `/cuenta`. |
| Dirección | `billing_address_collection: auto`; no garantiza una dirección completa ni su conservación en Customer. |
| B2B/B2C | Sin distinción explícita. No debe inferirse por profesión, país, nombre o presencia de VAT ID. |
| Impuestos | Sin `automatic_tax`, `tax_id_collection`, `customer_update`, tipos impositivos manuales ni lógica IVA/IGIC en el flujo. |
| Facturas | No se personalizan `invoice_settings` ni se sobreescriben los valores de Stripe; Billing genera las facturas de suscripción. No se inspeccionaron settings remotos. |
| Customer creation | Customer se crea explícitamente antes de la Session. No es necesario añadir `customer_creation`; ese parámetro solo admite modos payment/setup. [Referencia Stripe](https://docs.stripe.com/api/checkout/sessions/create). |

Se revisaron rutas billing/webhooks, alta de perfil en callback de Auth, lectura de cuenta/acceso/CRM, componentes de planes y SQL. Las menciones de identidad fiscal en páginas legales no participan en el cálculo y se mantienen intactas.

## B. Cambios implementados

- Selector explícito «Empresa/profesional» / «Particular» junto al botón de Pro, traducido ES/EN/FR. Sin elección predeterminada; servidor valida ambos valores. Dirección, razón social y Tax ID se recogen en Stripe.
- `billing_address_collection: required` y `customer_update: { address: auto, name: auto }` para conservar dirección/nombre en el Customer reutilizado.
- Nombre empresarial obligatorio para B2B mediante `name_collection.business`; nombre individual para B2C mediante `name_collection.individual`. [API de Checkout](https://docs.stripe.com/api/checkout/sessions/create).
- `tax_id_collection.enabled` para B2B; deshabilitado para B2C. No se exige VAT a todas las empresas: disponibilidad y recopilación dependen de Stripe y la ubicación. Un Customer con tax IDs guardados puede no ver otra vez ese formulario. [Recogida de tax IDs](https://docs.stripe.com/tax/checkout/tax-ids).
- `customer_type` se transporta en metadata de Session. Solo un evento firmado de Checkout completado, con `status: complete` y `payment_status: paid | no_payment_required`, guarda el tipo declarado en metadata de Customer y `profiles.customer_type`. Los pagos diferidos se clasifican al recibir `checkout.session.async_payment_succeeded`. El Customer es la referencia de facturación; no se duplica el tipo en cada suscripción. Las sesiones abandonadas o impagadas no cambian el tipo guardado.
- Metadata técnica `exacta7_checkout_created` evita que un Checkout creado anteriormente sobrescriba el tipo de uno más reciente en entregas secuenciales.
- Si se elige Particular y el Customer conserva nombre empresarial o tax IDs, se responde 409 y se pide contactar con soporte. No se borran datos fiscales ni se crea otro Customer para eludirlos. Es necesario revisar esa identidad antes de reutilizarla como particular.
- `customer.updated` se registra y reconoce, pero no escribe `customer_type`. Una edición manual de metadata no clasifica perfiles. Las actualizaciones de dirección/nombre/tax IDs permanecen en Stripe, sin copia local.
- Eventos de suscripción e `invoice.paid` / `invoice.payment_failed` consultan la suscripción actual antes de sincronizarla. Se admiten `invoice.parent.subscription_details.subscription` y el campo `invoice.subscription` de versiones anteriores. El estado de una factura no concede Pro por sí mismo.
- Se comprueban los errores al leer/registrar/marcar eventos y al resolver el usuario. Los fallos devuelven 500 para permitir reintentos.
- `automatic_tax` sigue omitido: no se activa ni se desactiva el de ninguna suscripción existente. No se crean reglas, porcentajes, OSS ni registros fiscales.

### Datos y privacidad

| Dato | Fuente / almacenamiento |
| --- | --- |
| Tipo de comprador | Declaración en Exacta7 → Session → Customer metadata → `profiles.customer_type`. |
| Stripe Customer ID | Campo existente en `profiles`. |
| Stripe Subscription ID | Campo existente en `subscriptions`. |
| País, dirección completa, CP, ciudad, región/provincia | `Customer.address` en Stripe: `country`, `line1`, `line2`, `postal_code`, `city`, `state`, cuando Stripe los proporciona. |
| Razón social / nombre | Customer en Stripe (`name` / `business_name` / `individual_name`, según API y recopilación). |
| Tax IDs | Recursos `Customer.tax_ids` en Stripe, recuperables con Customer ID; incluyen IDs, tipos, valores y verificación cuando existe. |
| Datos de la compra concreta | `Checkout Session.customer_details` en Stripe; no se copia el payload fiscal a Supabase. |

No se añaden columnas para dirección ni valores fiscales: no hay una funcionalidad local que necesite una segunda copia. La información se conserva en Stripe y puede conocerse desde el servidor con los IDs existentes. No hay un nuevo endpoint de consulta ni formulario fiscal local. No se guardan tarjetas, IP, payload completo de webhook ni tax IDs en metadata propia.

## C. Archivos modificados / creados

- `apps/web/app/api/billing/checkout/route.ts`: validación y parámetros de recopilación.
- `apps/web/app/api/webhooks/stripe/route.ts`: tipo de comprador, estado actual, facturas y errores.
- `apps/web/components/checkout-button.tsx`: selector y mensaje de identidad incompatible.
- `apps/web/lib/billing.ts`: tipo compartido y validación.
- `supabase/migrations/202610070001_billing_customer_type.sql`: única columna nueva.
- `tests/unit/stripe-billing.test.ts`: integración simulada de rutas/Stripe/Supabase.
- `tests/e2e/billing-checkout.spec.ts`: selector y envío de datos en tres idiomas y tamaños.
- `docs/STRIPE-BILLING-AUDIT.md`: este informe.

## D. Migración Supabase

Creada y **aplicada manualmente en producción por el titular**, según su confirmación del 8 de octubre de 2026: `202610070001_billing_customer_type.sql`. El titular confirma que `public.profiles.customer_type` aparece correctamente; el agente no ha realizado una comprobación remota independiente. Añade una columna nullable con CHECK `business | individual`, sin clasificar usuarios anteriores, eliminar datos, cambiar RLS ni ampliar permisos. Esta revisión no modifica la migración ni crea otra.

Para un entorno nuevo, ejecutar primero `supabase/billing-auth.sql`, que crea las tablas base, y después esta migración. No se ha inicializado un flujo completo de Supabase CLI ni se ha ejecutado `db push`.

Comprobación posterior de solo lectura:

```sql
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'profiles'
  and column_name in ('stripe_customer_id', 'customer_type');

select pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'public.profiles'::regclass
  and conname = 'profiles_customer_type_check';
```

El CHECK admite NULL para clientes que todavía no han declarado su tipo. No se ha probado la migración en una base real/local PostgreSQL disponible.

## E. Variables de entorno

Ninguna nueva. Se mantienen las variables existentes de Stripe, sus dos Price IDs y Supabase. No se ha añadido una variable para activar impuestos por accidente.

## F. Pendiente en Stripe Dashboard

Confirmar dirección fiscal del negocio en Canarias, encaje de IGIC/REPEP con Stripe, clasificación del SaaS, registros fiscales reales, presentación inclusiva/exclusiva de precios, configuración de facturas, capacidad del Portal para editar datos fiscales y eventos del endpoint. Se requiere además una futura activación explícita de automatic tax en el código de Checkout: configurar Dashboard por sí solo no habilita las Sessions creadas por esta API. [Configuración de Stripe Tax](https://docs.stripe.com/tax/set-up).

## G. Pasos posteriores exactos

1. Revisar con la asesoría la situación del autónomo en Canarias y con Stripe la cobertura del caso IGIC/REPEP. No seleccionar una jurisdicción equivalente ficticia ni registrar IVA peninsular como sustituto de IGIC.
2. La migración de producción ya fue aplicada y la columna comprobada manualmente por el titular. Si se utiliza otro entorno, aplicar y comprobar allí la misma migración antes de desplegar.
3. En la cuenta y entorno que ya utiliza Exacta7, abrir **Settings → Tax** y revisar la dirección completa de la sede fiscal, incluido CP/provincia canarios. Elegir la clasificación fiscal adecuada del servicio electrónico; confirmar que aplica al Product existente. [Setup de Tax](https://docs.stripe.com/tax/set-up).
4. En **Tax → Registrations/Locations**, reflejar únicamente registros reales que la asesoría haya confirmado. Añadir un registro en Stripe no equivale a registrarse ante la autoridad. No implementar OSS en esta tarea. [Registros para Checkout](https://docs.stripe.com/tax/checkout/page).
5. Revisar el tax behavior de los Price IDs existentes y el predeterminado. La opción exclusive puede aumentar lo que paga el cliente al activar impuestos. Si los precios existentes son incompatibles con mantener los importes acordados, resolverlo antes de activar Tax; no sustituir Price IDs ni cambiar 7,99/59,99 automáticamente. [Precios e impuestos](https://docs.stripe.com/tax/products-prices-tax-codes-tax-behavior).
6. En **Settings → Billing → Customer portal**, habilitar/revisar edición de nombre, dirección de facturación y tax IDs, y acceso a facturas. Mantener los ajustes de cancelación/planes ya acordados. El tipo empresa/particular no se edita automáticamente desde ese portal. [Configuración del Portal](https://docs.stripe.com/customer-management/configure-portal).
7. En **Workbench/Developers → Webhooks**, revisar el endpoint existente `https://exacta7.com/api/webhooks/stripe` y suscribir estos eventos: `checkout.session.completed`, `checkout.session.async_payment_succeeded` si se permiten pagos diferidos, `customer.updated`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`. Mantener el signing secret correspondiente y comprobar entregas 2xx/reintentos. No cambiar Test/Live ni versión del endpoint sin una revisión independiente. Esta revisión solo documenta el paso; no modifica la configuración remota.
8. Probar en un entorno de prueba, sin cambiar las claves del despliegue actual: nuevos/recurrentes, B2B con/sin VAT, B2C, Canarias/Península/Baleares/UE/no UE; cambios de dirección en Portal; fallos de pago, cancelación y reenvíos. Verificar datos completos en Customer y su factura; nunca usar datos fiscales reales de terceros como fixtures.
9. Cuando los pasos anteriores estén confirmados, hacer una tarea posterior que añada `automatic_tax: { enabled: true }` a la creación de Sessions y probar importes/renovaciones. Revisar por separado las suscripciones anteriores: activar Checkout no las actualiza automáticamente. Conservar cualquier automatic tax ya activo. [Activación y suscripciones existentes](https://docs.stripe.com/tax/set-up).

## H. Riesgos y límites abiertos

- La conservación de país y dirección permite una futura determinación fiscal; no demuestra que Stripe cubra IGIC/REPEP ni garantiza su tratamiento. La cobertura publicada de España se presenta como VAT y debe confirmarse específicamente el caso canario antes de activar Tax. [Cobertura de Stripe Tax](https://docs.stripe.com/tax/supported-countries).
- `ES` no determina por sí solo el territorio fiscal. No se añade ninguna clasificación por ciudad/CP ni porcentaje. El ámbito de IVA excluye Canarias; eso tampoco define por sí solo todas las obligaciones del SaaS. [AEAT: ámbito territorial](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/manual-iva-2025/capitulo-02-introduccion/territorio-que-se-aplica-impuesto.html).
- Tener un Tax ID o elegir business no demuestra derecho a un tratamiento fiscal concreto. Stripe puede validar algunos IDs de forma asíncrona; se debe revisar su resultado cuando corresponda. Los eventos `customer.tax_id.created/updated/deleted` no se sincronizan a una tabla local porque no hay copia de tax IDs; su estado actual permanece en Stripe. [Validación de tax IDs](https://docs.stripe.com/tax/checkout/tax-ids).
- `customer_type` documenta una declaración, no envía una instrucción fiscal ni modifica `tax_exempt`. Su metadata no garantiza por sí sola la localización ni la inversión del sujeto pasivo. La configuración posterior debe resolver también el caso B2B sin VAT ID, sin introducir supuestos tributarios en Exacta7.
- Clientes anteriores pueden carecer de dirección suficiente y tipo de comprador. El Portal y la revisión administrativa deberán completar esos datos; no hay un backfill automático.
- Un Customer con shipping previo puede tener prioridad de localización distinta de billing en Stripe Tax. Revisar esos Customers antes de activarlo; el código no borra shipping. [Jerarquía de direcciones](https://docs.stripe.com/tax/checkout/page).
- El bloqueo B2B→B2C conserva los datos existentes y requiere soporte. No se implementa un procedimiento automático de cambio de titular/identidad.
- La deduplicación existente no es un lock transaccional. El marcador de Checkout protege entregas secuenciales fuera de orden, pero no resuelve todas las carreras entre procesos ni sesiones creadas en el mismo segundo. El flujo anterior tampoco limita suscripciones simultáneas ni la ventana de idempotencia de creación del Customer; se mantienen como riesgos técnicos para otra tarea.
- Falta validación real contra Stripe y Supabase del proyecto. Las pruebas locales usan mocks para Stripe/Supabase y peticiones de Checkout interceptadas en navegador, sin cobrar ni crear objetos remotos.

## Validación

TypeScript, lint, tests unitarios y build ejecutados con los binarios locales equivalentes a los scripts de package.json. `pnpm` intentó descargar su versión fijada y falló; el sandbox de Windows también produjo errores de temporales de Vitest. La validación se ejecutó fuera de ese sandbox con los binarios ya instalados, sin modificar dependencias ni lockfile.

Resultados finales:

| Comprobación | Resultado |
| --- | --- |
| TypeScript (`tsc --noEmit`) | Aprobado, sin errores. |
| Lint (`eslint .`) | Aprobado, sin errores. |
| Tests unitarios (`vitest run`) | 107 aprobados en 10 archivos; 38 pruebas de facturación. Repetidos el 8 de octubre tras restringir la escritura de customer_type. |
| Build (`next build`, desde apps/web) | Aprobado; compila, valida tipos y genera las páginas. |
| E2E de facturación | 9 aprobados: ES/EN/FR en escritorio/móvil/tableta; selección explícita, B2B/B2C, mensual/anual y ausencia de desbordamiento. |
| `git diff --check` | Sin errores de whitespace. |

El build se repitió después de añadir compatibilidad con el campo de suscripción de facturas de webhooks anteriores. Las pruebas de navegador usan peticiones interceptadas; las pruebas de rutas usan Stripe/Supabase simulados. No se ejecutó toda la suite E2E clínica, ni una compra real. El agente no ejecutó la migración PostgreSQL contra producción; el titular la aplicó manualmente después. Los binarios proceden de las dependencias ya instaladas; no se cambió el package manager ni se descargaron dependencias para validar.

### Revisión final solicitada el 8 de octubre

Se eliminó la escritura de tipo de comprador desde `customer.updated` y se añadió la comprobación de finalización/pago del Checkout. Los perfiles NULL no se consultan para determinar acceso ni para crear Checkout; pueden declarar business/individual en una compra posterior. Solo se aceptan esos dos valores, tanto al recibir la solicitud como al guardar metadata de la Session; el CHECK de la migración permite además NULL como desconocido.

No se activa automatic tax ni se implementan reglas fiscales por país/ciudad/CP, IVA/IGIC/VAT/OSS. Precios de presentación y selección de Price IDs sin cambios. Durante esta revisión no se realizan llamadas a las APIs de Stripe/Supabase ni se hace commit/push. Las operaciones normales de facturación definidas en el código siguen creando Sessions/Customers y actualizando metadata; no modifican configuración fiscal de la cuenta, Products ni Prices.

Revalidación del 8 de octubre: TypeScript, lint, 107 tests unitarios y build aprobados. Se utilizan los binarios locales equivalentes a los scripts del proyecto, sin cambiar dependencias. Las 9 pruebas de navegador fueron aprobadas en la ejecución anterior; no se repitieron en esta revisión, cuyo ajuste es de webhook.

Resumen del diff de esta tarea respecto a HEAD, incluyendo archivos nuevos aún sin seguimiento:

| Archivo | Diff | Contenido |
| --- | --- | --- |
| `apps/web/app/api/billing/checkout/route.ts` | +31 / -2 | Validación de comprador y recopilación de dirección/nombre/Tax ID. |
| `apps/web/app/api/webhooks/stripe/route.ts` | +50 / -12 | Clasificación exclusivamente tras Checkout confirmado, pagos diferidos, estado actual de suscripciones/facturas y errores. |
| `apps/web/components/checkout-button.tsx` | +22 / -4 | Selector explícito ES/EN/FR y conflicto de identidad. |
| `apps/web/lib/billing.ts` | +6 / -0 | Tipo business/individual y validador. |
| `supabase/migrations/202610070001_billing_customer_type.sql` | Nuevo, 23 líneas | Migración ya aplicada manualmente; sin cambios en esta revisión. |
| `tests/unit/stripe-billing.test.ts` | Nuevo, 246 líneas | 38 pruebas de billing; incluye NULL, estados pendientes, valores inválidos y metadata editada. |
| `tests/e2e/billing-checkout.spec.ts` | Nuevo, 36 líneas | 9 casos de interfaz; sin cambios en esta revisión. |
| `docs/STRIPE-BILLING-AUDIT.md` | Nuevo | Auditoría, estado de migración, límites y comprobación final. |

Los archivos ajenos a billing que ya estaban sin seguimiento no se han modificado ni se incluyen en este resumen. No se han staged archivos; queda pendiente la confirmación del titular para cualquier commit/push.

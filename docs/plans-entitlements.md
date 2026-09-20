# Planes y precios

Gratis: buscador AEMPS, fichas regulatorias, contexto local de paciente, dosis y volumen, CRI básica, fluidoterapia básica y conversor de unidades.

Pro: diluciones y velocidad de goteo publicadas; las herramientas clínicas pendientes no se anuncian como disponibles. Fórmulas, unidades, fuentes, advertencias y datos regulatorios siguen visibles sin paywall.

Los importes visuales se centralizan en `apps/web/lib/pricing-config.ts` y pueden sobrescribirse mediante `NEXT_PUBLIC_STRIPE_PRO_MONTHLY_DISPLAY_PRICE` y `NEXT_PUBLIC_STRIPE_PRO_YEARLY_DISPLAY_PRICE`. Los Price IDs quedan solo en `STRIPE_PRO_MONTHLY_PRICE_ID` y `STRIPE_PRO_YEARLY_PRICE_ID`.

Para activar 7,99 €/mes y 59,99 €/año: crea ambos Price IDs en el mismo modo de Stripe, sustituye los dos IDs de servidor y los dos importes públicos, vuelve a desplegar y prueba Checkout. No cambies solo el copy: el importe mostrado debe coincidir con Stripe.

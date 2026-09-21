# Planes y precios

Gratis: buscador AEMPS, fichas regulatorias, contexto local de paciente, dosis y volumen, CRI básica, fluidoterapia básica y conversor de unidades.

Pro: diluciones y velocidad de goteo publicadas; las herramientas clínicas pendientes no se anuncian como disponibles. Fórmulas, unidades, fuentes, advertencias y datos regulatorios siguen visibles sin paywall.

Los importes públicos se centralizan en `apps/web/lib/pricing-config.ts`: Gratis 0 €, Pro mensual 7,99 €/mes y Pro anual 59,99 €/año. La presentación pública no contiene Price IDs.

Checkout selecciona exclusivamente `STRIPE_PRO_MONTHLY_PRICE_ID` o `STRIPE_PRO_YEARLY_PRICE_ID` en el servidor, según el intervalo elegido. El importe configurado en Stripe debe coincidir con el importe mostrado.

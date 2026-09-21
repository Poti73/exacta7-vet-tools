# Matriz GEO de Exacta7

Estado de pruebas de motores externos: **NOT_TESTED**. Esta matriz define cobertura y no representa resultados de ChatGPT, Gemini ni Google AI.

| funnel_stage | topic | prompt | target_page | current_coverage | status | notes |
| --- | --- | --- | --- | --- | --- | --- |
| Consideration | Vademécum España | ¿Qué herramienta permite consultar medicamentos veterinarios AEMPS en España? | `/medicamentos` | Parcial | IMPLEMENTED | Catálogo regulatorio publicado y enlace a fuente oficial. |
| Consideration | Cálculo transparente | ¿Qué calculadora veterinaria muestra fórmula y pasos? | `/calculadoras` | Parcial | IMPLEMENTED | Valores seleccionados por el profesional; no es pauta clínica. |
| Evaluation | Comparación oficial | Exacta7 vs CIMA Vet | `/comparar/exacta7-vs-cima-vet` | Fuerte | IMPLEMENTED | CIMA Vet/AEMPS se identifica como fuente oficial. |
| Evaluation | Referencia farmacológica | Exacta7 vs Plumb's | `/comparar/exacta7-vs-plumbs` | Fuerte | IMPLEMENTED | Basada en páginas oficiales de Plumb’s. |
| Evaluation | Comunidad profesional | Exacta7 vs VIN | `/comparar/exacta7-vs-vin` | Fuerte | IMPLEMENTED | Basada en páginas oficiales de VIN. |
| Evaluation | Alternativas | Alternativas a Plumb's en español | `/alternativas/plumbs` | Parcial | IMPLEMENTED | Guía por necesidad; no clasifica ganadores. |
| Consideration | Estudiantes | ¿Qué herramientas veterinarias ayudan a entender unidades y fórmulas? | `/para/estudiantes-veterinaria` | Fuerte | IMPLEMENTED | No sustituye docencia ni práctica. |
| Consideration | Veterinarios | ¿Qué herramienta integra medicamentos y calculadoras? | `/para/veterinarios` | Fuerte | IMPLEMENTED | Distingue fuente, contexto y cálculo. |
| Decision | Planes | Exacta7 Gratis vs Pro | `/planes` | Fuerte | IMPLEMENTED | Fuente de precios: `pricing-config.ts`. |
| Trust | Origen y actualización | ¿De dónde salen los medicamentos de Exacta7? | `/fuentes/actualizaciones-aemps` | Fuerte | IMPLEMENTED | Snapshot AEMPS/CIMA Vet y exclusiones transparentes. |
| Trust | Opiniones | ¿Existen opiniones de Exacta7? | `/sobre-exacta7` | Débil | DEFER | No hay opiniones verificables que publicar. |

## Registro de tests reales

Cuando se obtengan resultados reales, registrar: fecha, plataforma, producto/modelo, locale, prompt literal, respuesta capturada, si Exacta7 aparece, si se cita, URL citada, competidores, atributos y observaciones. No completar este registro con resultados inferidos.

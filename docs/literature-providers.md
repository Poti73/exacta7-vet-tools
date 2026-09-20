# Proveedores bibliográficos

`packages/knowledge/src/literature.ts` define `LiteratureProvider` y el adaptador PubMed. El flujo usa ESearch y ESummary; guarda metadata de cita y enlaza a PubMed, sin almacenar ni mostrar abstracts completos.

`/api/literature/search` acepta exclusivamente un slug de indicación controlado y una especie opcional. Consulta bajo demanda, no durante el render de página, y mantiene una caché en memoria de seis horas. Si PubMed no está disponible, devuelve el último resultado cacheado cuando existe o un estado no clínico de indisponibilidad.

Europe PMC y Crossref quedan preparados como adaptadores independientes. Crossref se reservará para enriquecer DOI, licencia y actualizaciones, nunca para decidir relevancia terapéutica.

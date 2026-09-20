# Calculadoras

El registro central es `packages/clinical-core/src/registry.ts`. Cada herramienta declara plan, inputs, unidades, fuente matemática, versión, fecha y estado de revisión.

Publicadas: dosis y volumen, CRI básica, fluidoterapia básica, conversor dimensional, diluciones y velocidad de goteo. Las tres últimas usan únicamente conversión de unidades o igualdad C₁V₁=C₂V₂; no eligen fármaco, diluyente, equipo ni objetivo clínico.

Pendientes de revisión veterinaria: RER, superficie corporal, osmolaridad/osmolalidad, anion gap, déficit hídrico y transfusión. No tienen ruta pública ni fórmula ejecutable hasta contar con fuente y límites revisados.

La matemática vive en `packages/clinical-core`; React solo captura inputs y muestra el registro.

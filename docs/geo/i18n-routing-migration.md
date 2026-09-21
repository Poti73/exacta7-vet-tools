# Migración futura de rutas por idioma

Estado: **DEFERRED**. La interfaz actual persiste ES/EN/FR en `localStorage`, mientras que las URLs públicas y el HTML inicial son españoles. Añadir `hreflang` ahora sería incorrecto porque no existen URLs diferenciadas por idioma.

## Arquitectura propuesta

1. Introducir segmentos estables `/es`, `/en`, `/fr` mediante middleware y una fuente de traducciones de servidor.
2. Mantener las URLs españolas actuales con redirección o canonical planificado, sin migrar fichas regulatorias hasta contar con un mapa completo de redirecciones.
3. Generar metadata, `lang`, canonical y `hreflang` por URL localizada real.
4. Generar sitemaps por locale e incluir únicamente equivalentes publicados.
5. Ejecutar regresión de búsqueda, auth, checkout, paciente, calculadoras y las 3.239 fichas antes de activar redirecciones.

## Condición de salida

No activar la migración hasta que cada ruta indexable tenga contenido equivalente localizado, redirects verificados y un plan de conservación de señales de las URLs existentes.
